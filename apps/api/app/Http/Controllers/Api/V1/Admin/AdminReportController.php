<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResolveReportRequest;
use App\Models\Comment;
use App\Models\ContentReport;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    /**
     * GET /api/v1/admin/reports
     * Danh sách báo cáo vi phạm cộng đồng (bài viết / bình luận).
     */
    public function index(Request $request): JsonResponse
    {
        $status = (string) $request->query('status', 'pending');
        $type = (string) $request->query('type', 'all');
        $search = trim((string) $request->query('q', ''));
        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);

        $query = ContentReport::query()
            ->with([
                'reporter:id,email,role',
                'reporter.touristProfile:id,user_id,name',
                'reporter.providerProfile:id,user_id,business_name',
                'reporter.socialProfile:id,user_id,display_name',
                'resolvedBy:id,email',
                'resolvedBy.socialProfile:id,user_id,display_name',
            ])
            ->latest('created_at');

        if ($status !== '' && $status !== 'all') {
            $query->where('status', $status);
        }

        if (in_array($type, ['post', 'comment'], true)) {
            $query->where('reportable_type', $type);
        }

        if ($search !== '') {
            $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';
            $query->where(function ($sub) use ($like) {
                $sub->where('reason', 'ilike', $like)
                    ->orWhereHas('reporter', function ($u) use ($like) {
                        $u->where('email', 'ilike', $like)
                            ->orWhereHas('touristProfile', fn ($tp) => $tp->where('name', 'ilike', $like))
                            ->orWhereHas('providerProfile', fn ($pp) => $pp->where('business_name', 'ilike', $like));
                    });
            });
        }

        $paginated = $query->paginate($perPage);
        $items = collect($paginated->items())->map(fn (ContentReport $r) => $this->transformReport($r))->values();

        return response()->json([
            'success' => true,
            'counts' => [
                'all' => ContentReport::count(),
                'pending' => ContentReport::where('status', 'pending')->count(),
                'resolved_hidden' => ContentReport::where('status', 'resolved_hidden')->count(),
                'dismissed' => ContentReport::where('status', 'dismissed')->count(),
            ],
            'data' => $items,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    /**
     * GET /api/v1/admin/reports/{id}
     * Chi tiết báo cáo kèm nội dung bài viết / bình luận bị báo cáo.
     */
    public function show(int $id): JsonResponse
    {
        $report = ContentReport::query()
            ->with([
                'reporter:id,email,role',
                'reporter.touristProfile:id,user_id,name',
                'reporter.providerProfile:id,user_id,business_name',
                'reporter.socialProfile:id,user_id,display_name',
                'resolvedBy:id,email',
                'resolvedBy.socialProfile:id,user_id,display_name',
            ])
            ->find($id);

        if (! $report) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy báo cáo vi phạm.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->transformReport($report, true),
        ]);
    }

    /**
     * POST /api/v1/admin/reports/{id}/resolve
     * Xử lý báo cáo: Ẩn nội dung vi phạm (hide) hoặc Bỏ qua báo cáo (dismiss).
     */
    public function resolve(ResolveReportRequest $request, int $id): JsonResponse
    {
        $report = ContentReport::find($id);
        if (! $report) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy báo cáo vi phạm.'], 404);
        }

        $action = $request->validated('action');
        $note = $request->validated('resolution_note');

        if ($action === 'hide') {
            if ($report->reportable_type === 'post') {
                Post::withTrashed()->where('id', $report->reportable_id)->update(['is_hidden' => true]);
            } elseif ($report->reportable_type === 'comment') {
                Comment::withTrashed()->where('id', $report->reportable_id)->update(['is_hidden' => true]);
            }
            $newStatus = 'resolved_hidden';
            $message = 'Đã ẩn nội dung vi phạm và hoàn tất xử lý báo cáo.';
        } else {
            $newStatus = 'dismissed';
            $message = 'Đã bỏ qua báo cáo vi phạm.';
        }

        $report->update([
            'status' => $newStatus,
            'resolved_by' => $request->user()->id,
            'resolution_note' => $note,
            'resolved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $this->transformReport($report->fresh([
                'reporter',
                'reporter.touristProfile',
                'reporter.providerProfile',
                'reporter.socialProfile',
                'resolvedBy',
                'resolvedBy.socialProfile',
            ]), true),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function transformReport(ContentReport $report, bool $detailed = false): array
    {
        $target = $this->resolveTargetContent($report, $detailed);

        return [
            'id' => $report->id,
            'reportable_type' => $report->reportable_type,
            'reportable_id' => $report->reportable_id,
            'reason' => $report->reason,
            'status' => $report->status,
            'resolution_note' => $report->resolution_note,
            'resolved_at' => $report->resolved_at,
            'created_at' => $report->created_at,
            'reporter' => [
                'id' => $report->reporter?->id,
                'name' => $report->reporter?->display_name ?? 'Người dùng',
                'email' => $report->reporter?->email,
            ],
            'resolved_by' => $report->resolvedBy ? [
                'id' => $report->resolvedBy->id,
                'name' => $report->resolvedBy->display_name,
                'email' => $report->resolvedBy->email,
            ] : null,
            'target' => $target,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function resolveTargetContent(ContentReport $report, bool $detailed): ?array
    {
        if ($report->reportable_type === 'post') {
            $post = Post::withTrashed()
                ->with(['user:id,email,role', 'user.touristProfile:id,user_id,name', 'user.providerProfile:id,user_id,business_name', 'user.socialProfile:id,user_id,display_name', 'media', 'service:id,name,type'])
                ->find($report->reportable_id);

            if (! $post) {
                return null;
            }

            return [
                'id' => $post->id,
                'content' => $post->content,
                'location_name' => $post->location_name,
                'is_hidden' => (bool) $post->is_hidden,
                'author' => [
                    'id' => $post->user?->id,
                    'name' => $post->user?->display_name ?? 'Tác giả',
                    'email' => $post->user?->email,
                ],
                'service' => $post->service ? [
                    'id' => $post->service->id,
                    'name' => $post->service->name,
                ] : null,
                'media' => $detailed ? $post->media->map(fn ($m) => [
                    'id' => $m->id,
                    'url' => $m->url,
                    'type' => $m->type ?? 'image',
                ])->values() : [],
                'media_count' => $post->media->count(),
            ];
        }

        if ($report->reportable_type === 'comment') {
            $comment = Comment::withTrashed()
                ->with(['user:id,email,role', 'user.touristProfile:id,user_id,name', 'user.providerProfile:id,user_id,business_name', 'user.socialProfile:id,user_id,display_name', 'post:id,content'])
                ->find($report->reportable_id);

            if (! $comment) {
                return null;
            }

            return [
                'id' => $comment->id,
                'content' => $comment->content,
                'is_hidden' => (bool) $comment->is_hidden,
                'post_id' => $comment->post_id,
                'post_excerpt' => $detailed ? $comment->post?->content : null,
                'author' => [
                    'id' => $comment->user?->id,
                    'name' => $comment->user?->display_name ?? 'Tác giả',
                    'email' => $comment->user?->email,
                ],
            ];
        }

        return null;
    }
}
