// src/components/social/FeedSelector.tsx
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedFeed } from './EnhancedFeed';
import { FeedType } from '@/hooks/useFeed';

export const FeedSelector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FeedType>('home');
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="home" onValueChange={(value) => setActiveTab(value as FeedType)}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>
        
        <TabsContent value="home">
          <EnhancedFeed
            feedType="home"
            emptyMessage="Your home feed is empty. Follow some users to see their posts here."
          />
        </TabsContent>
        
        <TabsContent value="explore">
          <EnhancedFeed
            feedType="explore"
            emptyMessage="No posts to explore at the moment. Check back later!"
          />
        </TabsContent>
        
        <TabsContent value="following">
          <EnhancedFeed
            feedType="following"
            emptyMessage="You're not following anyone yet. Follow users to see their posts here."
          />
        </TabsContent>
        
        <TabsContent value="popular">
          <EnhancedFeed
            feedType="popular"
            emptyMessage="No popular posts at the moment. Check back later!"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};