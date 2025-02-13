
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
  const [profile, setProfile] = useState<{ avatar_url: string | null } | null>(null);
  const user = useUser();

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();
      
    if (!error && data) {
      setProfile(data);
    }
  };

  useState(() => {
    fetchProfile();
  }, [user]);

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
    <Card className="p-4 mb-6">
      <div className="flex gap-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback>
            <User className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mb-3 min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={!content.trim() || isSubmitting}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
