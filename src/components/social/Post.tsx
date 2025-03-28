// src/components/social/Post.tsx
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Comments } from "./Comments";
import { usePostsApi } from "@/hooks/usePostsApi";
import { Post as PostType } from "@/lib/graphql/types";
import { useAuth } from "@/contexts/AuthContext";
import { PostImage } from "./PostImage";

// Extended interface to include imageVariants
interface ExtendedPostType extends PostType {
  imageVariants?: {
    original: string;
    thumbnail: string;
    medium: string;
    optimized: string;
  };
}

interface PostProps {
  post: ExtendedPostType;
  onPostUpdated?: () => void;
  alwaysShowComments?: boolean;
  onClick?: () => void; // Add onClick prop
}

const formatContentWithTickers = (content: string) => {
  // Match $TICKER pattern (2-5 characters after $)
  const tickerPattern = /\$([A-Z]{2,5})/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = tickerPattern.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    // Add the ticker as a span with special styling
    const ticker = match[1];
    parts.push(
      <button
        key={match.index}
        onClick={(e) => {
          e.stopPropagation();
          window.location.href = `/analysis?ticker=${ticker}`;
        }}
        className="text-blue-500 hover:underline font-medium"
      >
        ${ticker}
      </button>
    );
    lastIndex = match.index + match[0].length;
  }
  // Add remaining text after last match
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
};

export const Post = ({ post, onPostUpdated, alwaysShowComments, onClick }: PostProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Local state to control UI independently of API calls
  const [isLiked, setIsLiked] = useState(post.isLikedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLiking, setIsLiking] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.commentsCount);
  const [commentsVersion, setCommentsVersion] = useState(0);

  // Show comments by default if on activity page or alwaysShowComments is true
  const [showComments, setShowComments] = useState(
    alwaysShowComments || 
    location.pathname === '/activity' ||
    // Check if there are comments to show
    (post.comments && post.comments.length > 0)
  );
  
  // Use GraphQL hooks
  const { useLikePost } = usePostsApi();
  const { toggleLike } = useLikePost();

  // Keep local state in sync with props (important for when the parent updates)
  useEffect(() => {
    setIsLiked(post.isLikedByMe);
    setLikesCount(post.likesCount);
  }, [post.isLikedByMe, post.likesCount]);

  // Handle comment display based on different properties/paths
  useEffect(() => {
    if (alwaysShowComments || location.pathname === '/activity' || 
        (post.comments && post.comments.length > 0)) {
      setShowComments(true);
    }
  }, [alwaysShowComments, location.pathname, post.comments]);

  const handleLike = async (e: React.MouseEvent) => {
    // Stop event propagation to prevent post click when clicking the like button
    e.stopPropagation();
    
    if (!user || isLiking) return;
    
    // Set local state IMMEDIATELY for instant UI update
    setIsLiking(true);
    setIsLiked(!isLiked); 
    setLikesCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
    
    try {
      // Use GraphQL hook to update the backend
      await toggleLike(post.id, isLiked);
      
      // No need to update local state again as we've already done it optimistically
      
      // Only call onPostUpdated if explicitly needed
      if (onPostUpdated && location.pathname === '/activity') {
        onPostUpdated();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      
      // Revert UI updates if there was an error
      setIsLiked(isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setIsLiking(false);
    }
  };

  const toggleComments = (e: React.MouseEvent) => {
    // Stop event propagation to prevent post click when toggling comments
    e.stopPropagation();
    setShowComments(!showComments);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    // Stop event propagation to prevent post click when clicking on user
    e.stopPropagation();
    
    if (post.author.id === user?.id) {
      navigate('/profile');
    } else {
      navigate(`/profile?id=${post.author.id}`);
    }
  };
  
  const handleCommentAdded = (isDeleted = false) => {
    // Update local UI state
    if (isDeleted) {
      // Decrement for deletion
      setLocalCommentsCount(prev => Math.max(0, prev - 1));
    } else {
      // Increment for addition
      setLocalCommentsCount(prev => prev + 1);
    }
    
    // Increment the version to force remounting of the Comments component
    setCommentsVersion(prev => prev + 1);
  };
  
  // Add a handler for clicking on the post itself
  const handlePostClick = () => {
    // Only navigate if an onClick handler is provided
    if (onClick) {
      onClick();
    } else {
      // If no onClick provided but we're not on a post detail page already,
      // navigate to the post detail page
      if (!location.pathname.includes(`/post/${post.id}`)) {
        navigate(`/post/${post.id}`);
      }
    }
  };

  return (
    <Card 
      className={`p-4 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handlePostClick}
    >
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0" onClick={handleUserClick}>
          <AvatarImage src={post.author.avatarUrl || undefined} />
          <AvatarFallback>
            <User className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              className="hover:underline font-semibold"
              onClick={handleUserClick}
            >
              {post.author.displayName}
            </button>
            <button 
              className="text-gray-500 hover:underline"
              onClick={handleUserClick}
            >
              @{post.author.displayName}
            </button>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">
              {post.createdAt 
                ? (() => {
                    try {
                      return formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
                    } catch (e) {
                      console.warn('Invalid date:', post.createdAt);
                      return 'recently';
                    }
                  })()
                : 'recently'}
            </span>
          </div>
          <p className="mt-2 text-gray-900 break-words">
            {formatContentWithTickers(post.content)}
          </p>
          
          {post.imageUrl && (
            <PostImage 
              imageUrl={post.imageUrl} 
              variants={post.imageVariants} 
              alt={`Post by ${post.author.displayName}`}
            />
          )}

          <div className="flex gap-6 mt-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleLike}
              disabled={!user || isLiking}
            >
              <Heart 
                className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
              />
              <span>{likesCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={toggleComments}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{localCommentsCount}</span>
            </Button>
          </div>

          {showComments && (
            <div 
              className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-4"
              onClick={(e) => e.stopPropagation()} // Prevent post click when interacting with comments
            >
              <Comments 
                key={`comments-${post.id}-${commentsVersion}`}
                postId={post.id} 
                comments={post.comments || []}
                onCommentAdded={handleCommentAdded}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};