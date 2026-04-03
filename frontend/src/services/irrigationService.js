import axios from 'axios';

/**
 * Irrigation Service - API Integration Layer
 * Communicates with FastAPI backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const irrigationService = {
  /**
   * Predict irrigation requirement
   */
  predictIrrigation: async (sensorData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/predict-irrigation`,
        sensorData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail ||
        'Failed to get irrigation prediction'
      );
    }
  },

  /**
   * Generate irrigation alert
   */
  generateAlert: async (sensorData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/generate-alert`,
        sensorData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail ||
        'Failed to generate alert'
      );
    }
  },

  /**
   * Get optimization strategy
   */
  getOptimizationStrategy: async (sensorData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/optimization-strategy`,
        sensorData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail ||
        'Failed to get optimization strategy'
      );
    }
  },

  /**
   * Get model information
   */
  getModelInfo: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/model-info`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get model information');
    }
  },

  /**
   * Health check
   */
  healthCheck: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/healthz`);
      return response.data;
    } catch (error) {
      throw new Error('API service is not available');
    }
  }
};

export default irrigationService;
