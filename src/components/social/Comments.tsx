/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/social/Comments.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Comment as CommentComponent } from "./Comment";
import { useCommentsApi } from "@/hooks/useCommentsApi";
import { AlertCircle } from "lucide-react";

interface CommentsProps {
  postId: string;
  comments?: any[]; // Accept any comment format for flexibility
  onCommentAdded?: (isDelete?: boolean) => void; // Add optional parameter
}

// Helper for ensuring valid dates
const ensureValidDate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return new Date().toISOString();
  
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
};

// Helper to deduplicate comments by ID
const deduplicateComments = (comments: any[]): any[] => {
  const uniqueComments = new Map();
  comments.forEach(comment => {
    // Only keep the first occurrence of each comment ID
    if (!uniqueComments.has(comment.id)) {
      uniqueComments.set(comment.id, comment);
    }
  });
  return Array.from(uniqueComments.values());
};

export const Comments = ({ postId, comments: initialComments = [], onCommentAdded }: CommentsProps) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [localComments, setLocalComments] = useState<any[]>([]);
  const [optimisticComments, setOptimisticComments] = useState<Map<string, any>>(new Map());
  
  // Track comment processing state
  const commentsInitializedRef = useRef(false);
  const lastRefreshTimeRef = useRef(Date.now());
  const isProcessingRef = useRef(false);
  
  // Use GraphQL hooks
  const { useCreateComment, usePostComments } = useCommentsApi();
  const { createComment, loading: createLoading } = useCreateComment();
  
  // Fetch comments with GraphQL, using the enhanced hook
  const { 
    safeComments, 
    loading: commentsLoading, 
    error: commentsError, 
    refetch: refetchComments 
  } = usePostComments(
    postId,
    { first: 20 }
  );

  // When comments are loaded from the API, process them
  useEffect(() => {
    if (commentsLoading || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    
    try {
      // Get comments from API if available, otherwise use props
      let newComments: any[] = [];
      
      if (safeComments && safeComments.length > 0) {
        newComments = [...safeComments];
      } else if (initialComments && initialComments.length > 0 && !commentsInitializedRef.current) {
        newComments = initialComments.map(comment => ({
          ...comment,
          createdAt: ensureValidDate(comment.createdAt || comment.created_at)
        }));
        commentsInitializedRef.current = true;
      }
      
      // Add any optimistic comments that don't have server counterparts yet
      if (optimisticComments.size > 0) {
        const pendingComments = Array.from(optimisticComments.values());
        
        // For each pending comment, check if we now have a real version
        pendingComments.forEach(pendingComment => {
          const hasRealComment = newComments.some(
            comment => comment.content === pendingComment.content && 
                     Math.abs(new Date(comment.createdAt).getTime() - 
                             new Date(pendingComment.createdAt).getTime()) < 5000
          );
          
          if (!hasRealComment) {
            newComments.push(pendingComment);
          }
        });
      }
      
      // Deduplicate and sort comments
      if (newComments.length > 0) {
        const uniqueComments = deduplicateComments(newComments)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setLocalComments(uniqueComments);
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [safeComments, initialComments, commentsLoading, optimisticComments]);

  // Throttled comment refresh function
  const refreshComments = () => {
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 2000) {
      return; // Don't refresh more than once every 2 seconds
    }
    
    lastRefreshTimeRef.current = now;
    refetchComments();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || createLoading) return;
    
    setErrorMsg(null);
    const commentContent = newComment.trim();
    setNewComment(""); // Clear input immediately for better UX

    // Create a temporary ID for optimistic rendering
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    
    // Create an optimistic comment
    const optimisticComment = {
      id: tempId,
      content: commentContent,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLikedByMe: false,
      author: {
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl
      }
    };

    // Add this to our optimistic comments map
    setOptimisticComments(prev => {
      const next = new Map(prev);
      next.set(tempId, optimisticComment);
      return next;
    });

    try {
      // Call the GraphQL mutation to create the comment
      await createComment({ 
        postId, 
        content: commentContent
      });
      
      // After successful creation, schedule a refresh to get the real comment
      refreshComments();
      
      // Notify parent component
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setErrorMsg("Failed to post comment. Please try again.");
      
      // Remove the optimistic comment on error
      setOptimisticComments(prev => {
        const next = new Map(prev);
        next.delete(tempId);
        return next;
      });
      
      // Restore the comment text
      setNewComment(commentContent);
    }
  };

  const handleCommentDeleted = (commentId: string) => {
    // Remove the deleted comment from local state
    setLocalComments(prevComments => 
      prevComments.filter(comment => comment.id !== commentId)
    );
    
    // Also remove from optimistic comments if it exists there
    setOptimisticComments(prev => {
      const next = new Map(prev);
      next.delete(commentId);
      return next;
    });
    
    // Notify parent about the deletion
    if (onCommentAdded) {
      onCommentAdded(true); 
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setErrorMsg(null);
    
    try {
      await refetchComments();
    } catch (error) {
      console.error("Error retrying comment fetch:", error);
      setErrorMsg("Still having trouble. Please try again later.");
    } finally {
      setIsRetrying(false);
    }
  };

  // A function to safely prepare comment data for the Comment component
  const prepareCommentData = (comment: any) => {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: ensureValidDate(comment.createdAt || comment.created_at),
      likesCount: comment.likesCount || 0,
      isLikedByMe: comment.isLikedByMe || false,
      postId: postId,
      author: {
        id: comment.author?.id || comment.user?.id || user?.id || 'unknown',
        displayName: comment.author?.displayName || comment.user?.full_name || user?.displayName || 'Unknown User',
        avatarUrl: comment.author?.avatarUrl || comment.user?.avatar_url || user?.avatarUrl
      }
    };
  };

  return (
    <div className="space-y-4">
      {/* Comment form */}
      {user && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-between items-center">
            {errorMsg && (
              <p className="text-red-500 text-sm">{errorMsg}</p>
            )}
            <Button 
              type="submit" 
              disabled={!newComment.trim() || createLoading}
              className="ml-auto"
            >
              {createLoading ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      )}

      {/* Comments section with error handling */}
      <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-800">
        {commentsLoading && !localComments.length ? (
          <div className="py-4 text-center text-gray-500">
            {isRetrying ? "Retrying..." : "Loading comments..."}
          </div>
        ) : commentsError && !localComments.length ? (
          <div className="py-4">
            <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-md mb-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                <AlertCircle size={16} />
                <p className="text-sm font-medium">Error loading comments</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                  Unable to load comments.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="text-xs"
                >
                  {isRetrying ? "Retrying..." : "Retry"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Comment list - with deduplication */}
        {localComments.length > 0 ? (
          deduplicateComments(localComments).map((comment: any) => (
            <CommentComponent
              key={comment.id}
              comment={prepareCommentData(comment)}
              postId={postId}
              onCommentDeleted={() => handleCommentDeleted(comment.id)}
            />
          ))
        ) : !commentsLoading && !commentsError ? (
          <div className="py-4 text-center text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : null}
      </div>
    </div>
  );
};