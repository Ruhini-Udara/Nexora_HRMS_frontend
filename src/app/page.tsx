import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeHeader } from "@/components/home/home-header";
import { FeatureCard } from "@/components/home/feature-card";
import { HomeFooter } from "@/components/home/home-footer";

export default function Home() {
  const features = [
    {
      title: "Leave",
      description: "Apply, approve, and track leaves effortlessly.",
    },
    {
      title: "Transfer",
      description: "Manage employee transfers smoothly and quickly.",
    },
    {
      title: "Training",
      description: "Plan and track trainings to boost skills.",
    },
    {
      title: "Manage",
      description: "Oversee HR tasks and employee data with ease.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <HomeHeader />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-6 lg:px-16 xl:px-20 py-12 lg:py-20 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            {/* Main Title */}
            <h1 className="text-5xl lg:text-6xl font-extrabold text-[#8B3A00] dark:text-[#E5BA73] mb-5 tracking-tight">
              HR MATE
            </h1>

            {/* Tagline */}
            <p className="text-lg lg:text-xl text-[#8B3A00] dark:text-[#D68D5A] font-medium mb-8">
              Smarter HR Management, Seamless Employee Experience.
            </p>

            {/* CTA Button */}
            <Link href="/login">
              <Button
                className="bg-[#8B3A00] hover:bg-[#722F00] text-white font-bold text-base px-8 py-5 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="container mx-auto px-6 lg:px-16 xl:px-20 py-8 lg:py-12 max-w-7xl">
          <div className="bg-zinc-200 dark:bg-zinc-800 rounded-3xl p-6 lg:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}
