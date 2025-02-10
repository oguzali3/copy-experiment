
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

type ProfileFormData = {
  firstName: string;
  lastName: string;
  email: string;
  twitter: string;
  linkedin: string;
};

const Profile = () => {
  const [isPublicPortfolio, setIsPublicPortfolio] = useState(false);
  const [isPaidFeatures, setIsPaidFeatures] = useState(false);

  const { register, handleSubmit } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      twitter: "",
      linkedin: "",
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    console.log("Profile data:", data);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="john.doe@example.com"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Social Links</h2>
            <div className="space-y-2">
              <label htmlFor="twitter" className="text-sm font-medium">
                Twitter Profile
              </label>
              <Input
                id="twitter"
                {...register("twitter")}
                placeholder="@johndoe"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="linkedin" className="text-sm font-medium">
                LinkedIn Profile
              </label>
              <Input
                id="linkedin"
                {...register("linkedin")}
                placeholder="linkedin.com/in/johndoe"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Portfolio Settings</h2>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="publicPortfolio"
                checked={isPublicPortfolio}
                onChange={(e) => setIsPublicPortfolio(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="publicPortfolio" className="text-sm font-medium">
                Make my portfolio public
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="paidFeatures"
                checked={isPaidFeatures}
                onChange={(e) => setIsPaidFeatures(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="paidFeatures" className="text-sm font-medium">
                Enable paid features
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
