import apiClient from "../../../lib/apiClient";

const providerCampaignApi = {
  async list() {
    return apiClient.get("/provider/campaigns");
  },

  async toggleService(campaignId, payload) {
    return apiClient.put(`/provider/campaigns/${campaignId}/services`, payload);
  },
};

export default providerCampaignApi;
