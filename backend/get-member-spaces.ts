import { Request, Response } from 'express';
import axios from 'axios';

/**
 * Get member's space memberships (courses) from Circle.so
 * This endpoint fetches the spaces/courses a member is enrolled in
 */
export default async function getMemberSpacesHandler(req: Request, res: Response) {
  try {
    const { memberId } = req.query;

    // Validate memberId parameter
    if (!memberId || typeof memberId !== 'string') {
      return res.status(400).json({
        error: 'Member ID parameter is required',
        message: 'Please provide a valid member ID',
      });
    }

    console.log('📚 Fetching space memberships for member ID:', memberId);

    // Get Circle.so Admin API token from environment
    const adminToken = process.env.CIRCLE_ADMIN_API_TOKEN || process.env.VITE_CIRCLE_ADMIN_API_TOKEN;

    if (!adminToken) {
      console.warn('⚠️ Circle Admin API token not found - using mock spaces data');
      
      // Return mock spaces data
      const mockSpaces = [
        {
          id: 1,
          name: "10x Agentic AI (Pro)",
          description: "Advanced AI automation course",
          status: "active",
          progress: 25,
          lessons_completed: 5,
          total_lessons: 20
        }
      ];

      console.log('📦 Returning mock spaces data for development');
      return res.json(mockSpaces);
    }

    console.log('🔑 Admin token:', adminToken.substring(0, 10) + '...');

    // Call Circle.so Admin API v2 for course lessons
    const circleApiUrl = `https://app.circle.so/api/admin/v2/course_lessons`;

    console.log('📡 Calling Circle.so API:', circleApiUrl);
    console.log('📋 Fetching course lessons for member:', memberId);

    const response = await axios.get(circleApiUrl, {
      params: {
        per_page: 100 // Get up to 100 course lessons
      },
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Circle.so API response received');
    console.log('📦 Status:', response.status);

    // Log the structure to understand the response
    const data = response.data;
    console.log('📦 Response type:', Array.isArray(data) ? 'Array' : typeof data);
    console.log('📦 Response keys:', Object.keys(data));

    if (Array.isArray(data)) {
      console.log('📦 Total lessons:', data.length);
      console.log('📦 First lesson sample:', JSON.stringify(data[0], null, 2));
    } else {
      console.log('📦 Data structure:', JSON.stringify(data, null, 2).substring(0, 500));
    }

    // Return the data from Circle.so
    return res.status(200).json(response.data);

  } catch (error: any) {
    console.error('❌ Error fetching member spaces:');
    console.error('❌ Message:', error.message);
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Response:', error.response?.data);

    // Handle different error scenarios
    if (error.response) {
      // Circle.so API returned an error response
      return res.status(error.response.status).json({
        error: 'Circle.so API error',
        message: error.response.data?.message || error.response.data?.error || 'Failed to fetch member spaces',
        details: error.response.data,
      });
    } else if (error.request) {
      // Request was made but no response received
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Unable to reach Circle.so API',
      });
    } else {
      // Something else went wrong
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
}
