<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContentReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ContentReport::query()
            ->with(['reporter:id,email,role', 'reviewer:id,email,role'])
            ->latest('id');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('target_type')) {
            $query->where('target_type', $request->string('target_type')->toString());
        }

        $reports = $query->paginate((int) $request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $reports,
            'meta' => [
                'pending_count' => ContentReport::where('status', 'pending')->count(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $report = ContentReport::with(['reporter:id,email,role', 'reviewer:id,email,role'])->find($id);

        if (! $report) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy báo cáo vi phạm.'], 404);
        }

        return response()->json(['success' => true, 'data' => $report]);
    }

    public function hideContent(Request $request, int $id): JsonResponse
    {
        $report = ContentReport::find($id);

        if (! $report) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy báo cáo vi phạm.'], 404);
        }

        DB::transaction(function () use ($request, $report) {
            $table = $report->target_type === 'comment' ? 'post_comments' : 'posts';
            if (DB::getSchemaBuilder()->hasTable($table) && DB::getSchemaBuilder()->hasColumn($table, 'is_hidden')) {
                DB::table($table)
                    ->where('id', $report->target_id)
                    ->update(['is_hidden' => true, 'updated_at' => now()]);
            }

            $report->update([
                'status' => 'resolved_hidden',
                'reviewed_by' => $request->user()?->id,
                'reviewed_at' => now(),
                'admin_note' => $request->input('admin_note'),
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Đã ẩn nội dung vi phạm và đóng báo cáo.',
            'data' => $report->fresh(),
        ]);
    }

    public function dismiss(Request $request, int $id): JsonResponse
    {
        $report = ContentReport::find($id);

        if (! $report) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy báo cáo vi phạm.'], 404);
        }

        $report->update([
            'status' => 'dismissed',
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
            'admin_note' => $request->input('admin_note'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã bỏ qua báo cáo.',
            'data' => $report->fresh(),
        ]);
    }
}
