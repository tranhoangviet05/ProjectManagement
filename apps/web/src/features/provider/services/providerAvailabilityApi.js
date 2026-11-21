import apiClient from "../../../lib/apiClient";

export const providerAvailabilityApi = {
  async getAvailability(serviceId, from, to) {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    return apiClient.get(`/provider/services/${serviceId}/availability${qs ? `?${qs}` : ""}`);
  },

  async upsertAvailability(serviceId, payload) {
    return apiClient.put(`/provider/services/${serviceId}/availability`, payload);
  },

  async listRoomTypes(serviceId) {
    return apiClient.get(`/provider/services/${serviceId}/room-types`);
  },

  async createRoomType(serviceId, payload) {
    return apiClient.post(`/provider/services/${serviceId}/room-types`, payload);
  },

  async updateRoomType(serviceId, roomTypeId, payload) {
    return apiClient.put(`/provider/services/${serviceId}/room-types/${roomTypeId}`, payload);
  },

  async deleteRoomType(serviceId, roomTypeId) {
    return apiClient.delete(`/provider/services/${serviceId}/room-types/${roomTypeId}`);
  },
};

export default providerAvailabilityApi;
