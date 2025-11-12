import axios from 'axios';

interface VerifyMemberRequest {
  email: string;
}

interface VerifyMemberResponse {
  authorized: boolean;
  message: string;
  accessToken?: string;
}

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email }: VerifyMemberRequest = req.body;

    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({
        authorized: false,
        message: 'Invalid email address',
      });
    }

    // Get Circle API token from environment variables
    const circleApiToken = process.env.CIRCLE_API_TOKEN;
    if (!circleApiToken) {
      console.error('CIRCLE_API_TOKEN not configured');
      return res.status(500).json({
        authorized: false,
        message: 'Server configuration error',
      });
    }

    // Call Circle.so API to verify membership
    const circleApiUrl = process.env.VITE_CIRCLE_API_URL || 'https://app.circle.so/api/v1/headless/auth_token';

    const response = await axios.post(
      circleApiUrl,
      { email },
      {
        headers: {
          'Authorization': `Bearer ${circleApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // If we get here, the user is authorized (200 response)
    const responseData: VerifyMemberResponse = {
      authorized: true,
      message: 'Access granted. Welcome to the Circle community!',
      accessToken: response.data.access_token,
    };

    return res.status(200).json(responseData);

  } catch (error: any) {
    // Handle Circle API errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 401 || status === 404) {
        // User is not a member
        return res.status(200).json({
          authorized: false,
          message: 'You are not authorized. Only Circle community members can access this.',
        });
      }

      // Log other API errors
      console.error('Circle API error:', error.response?.data || error.message);
      return res.status(500).json({
        authorized: false,
        message: 'Error verifying membership. Please try again later.',
      });
    }

    // Handle unexpected errors
    console.error('Unexpected error:', error);
    return res.status(500).json({
      authorized: false,
      message: 'An unexpected error occurred. Please try again later.',
    });
  }
}
