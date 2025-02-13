
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "lucide-react";

export const CreatePost = ({ onPostCreated }: { onPostCreated?: () => void }) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useUser();

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert([{ content: content.trim(), user_id: user.id }]);

      if (error) throw error;

      setContent("");
      toast.success("Post created successfully!");
      onPostCreated?.();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 mb-6 border-b border-t-0 border-x-0 rounded-none">
      <div className="flex gap-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback>
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mb-3 min-h-[100px] border-none resize-none p-0 focus-visible:ring-0"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={!content.trim() || isSubmitting}
              className="rounded-full px-6 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
