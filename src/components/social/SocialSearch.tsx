
import { useState, useRef, useEffect } from "react";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { SearchResults } from "./SearchResults";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchParams } from "react-router-dom";

export const SocialSearch = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const searchData = async () => {
      if (!debouncedQuery.trim()) {
        setProfiles([]);
        setPosts([]);
        return;
      }

      setIsLoading(true);
      try {
        // Search profiles
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .or(`full_name.ilike.%${debouncedQuery}%,username.ilike.%${debouncedQuery}%`)
          .limit(3);

        // Search posts
        const { data: postsData } = await supabase
          .from('posts')
          .select(`
            *,
            user:user_id (
              id,
              full_name,
              avatar_url,
              username
            ),
            likes:post_likes (count),
            comments:post_comments (count),
            user_likes:post_likes (id, user_id)
          `)
          .ilike('content', `%${debouncedQuery}%`)
          .order('created_at', { ascending: false })
          .limit(5);

        setProfiles(profilesData || []);
        setPosts(postsData ? postsData.map(post => ({
          ...post,
          likes_count: post.likes[0]?.count || 0,
          comments_count: post.comments[0]?.count || 0,
          is_liked: false
        })) : []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    searchData();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowResults(false);
      setSearchParams({ q: query.trim() });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-4 dark:bg-[#2b2b35] dark:text-gray-200 dark:border-gray-700"
            placeholder="Search profiles, posts, or $symbols..."
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-500 dark:text-gray-400" />
          )}
        </div>
      </form>

      {showResults && (
        <SearchResults
          query={query}
          profiles={profiles}
          posts={posts}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
};
