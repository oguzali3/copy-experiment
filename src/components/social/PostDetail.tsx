// src/pages/PostDetail.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { Post } from '@/components/social/Post';
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { SocialHeader } from "@/components/social/SocialHeader";
import { Spinner } from '@/components/ui/loaders';

const GET_POST = gql`
  query GetPost($id: String!) {
    post(id: $id) {
      id
      content
      imageUrl
      imageVariants {
        original
        thumbnail
        medium
        optimized
      }
      createdAt
      updatedAt
      author {
        id
        displayName
        avatarUrl
        isVerified
      }
      likesCount
      commentsCount
      isLikedByMe
      comments {
        id
        content
        createdAt
        author {
          id
          displayName
          avatarUrl
        }
      }
    }
  }
`;

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { loading, error, data } = useQuery(GET_POST, {
    variables: { id },
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Error fetching post:', error);
    }
  });

  useEffect(() => {
    console.log('PostDetail component mounted with ID:', id);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="fixed left-0 top-0 h-full w-[68px] border-r border-gray-200 dark:border-gray-800">
          <SocialSidebar />
        </div>
        
        <div className="fixed left-1/2 transform -translate-x-1/2" style={{
          width: '680px',
          marginLeft: '34px'
        }}>
          <div className="border-x border-gray-200 dark:border-gray-800 h-screen flex flex-col bg-white dark:bg-gray-900">
            <SocialHeader />
            <div className="flex-1 overflow-y-auto flex justify-center items-center">
              <Spinner size="lg" label="Loading post..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="fixed left-0 top-0 h-full w-[68px] border-r border-gray-200 dark:border-gray-800">
          <SocialSidebar />
        </div>
        
        <div className="fixed left-1/2 transform -translate-x-1/2" style={{
          width: '680px',
          marginLeft: '34px'
        }}>
          <div className="border-x border-gray-200 dark:border-gray-800 h-screen flex flex-col bg-white dark:bg-gray-900">
            <SocialHeader />
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col items-center justify-center p-8">
                <h1 className="text-2xl font-bold mb-4">Post not found</h1>
                <p className="text-gray-500 mb-6">
                  The post you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <button 
                  onClick={() => navigate('/feed')}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Back to Feed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="fixed left-0 top-0 h-full w-[68px] border-r border-gray-200 dark:border-gray-800">
        <SocialSidebar />
      </div>
      
      <div className="fixed left-1/2 transform -translate-x-1/2" style={{
        width: '680px',
        marginLeft: '34px'
      }}>
        <div className="border-x border-gray-200 dark:border-gray-800 h-screen flex flex-col bg-white dark:bg-gray-900">
          <SocialHeader />
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-4">
              <button 
                onClick={() => navigate(-1)} 
                className="mb-4 text-blue-500 hover:underline flex items-center"
              >
                ← Back
              </button>
              
              <Post post={data.post} alwaysShowComments={true} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="fixed right-0 top-0 w-[320px] h-full p-4">
        {/* You could add related posts or other content here */}
      </div>
    </div>
  );
};

export default PostDetail;