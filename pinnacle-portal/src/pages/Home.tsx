import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Bot, Presentation, Code, Palette, Gamepad2, Trophy } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

const events = [
  {
    icon: <BrainCircuit className="h-6 w-6 text-primary" />,
    title: "IT Quiz – Battle of Brain",
    text: "Date: 28 Jan | Fee: ₹200/team | Team of 2",
  },
  {
    icon: <Bot className="h-6 w-6 text-primary" />,
    title: "AI Prompt Engineering",
    text: "Date: 28 Jan | Fee: ₹100/person | Solo event",
  },
  {
    icon: <Presentation className="h-6 w-6 text-primary" />,
    title: "Poster Presentation",
    text: "Date: 29 Jan | Fee: ₹300/team | Team of 1-3",
  },
  {
    icon: <Code className="h-6 w-6 text-primary" />,
    title: "Coding Clash",
    text: "Date: 29 Jan | Fee: ₹200/person | Solo event",
  },
  {
    icon: <Palette className="h-6 w-6 text-primary" />,
    title: "Tech Rangoli",
    text: "Date: 28 Jan | Fee: ₹100/person | Solo event",
  },
  {
    icon: <Gamepad2 className="h-6 w-6 text-primary" />,
    title: "Game Fest",
    text: "CS, NFS, BGMI & more | Entry: ₹100/person",
  },
];


export const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white -mt-16 -mx-4">
        <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="mt-6 mb-4 text-4xl font-bold tracking-tight md:text-6xl">
            Pinnacle 2025
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
            The Department of Computer Applications proudly presents a National Level IT Event on 28th & 29th January 2026.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-accent text-primary font-bold hover:bg-accent-hover shadow-lg">
                  <Trophy className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-accent text-primary font-bold hover:bg-accent-hover shadow-lg">
                    Register Now
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-white backdrop-blur-sm bg-white/10">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary">Our Events</h2>
          <p className="text-text-secondary mt-2">Explore the exciting challenges we have for you.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <InfoCard key={index} icon={event.icon} title={event.title} text={event.text} />
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="bg-card py-20 -mx-4 pb-8">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-primary md:text-4xl">
            About Pinnacle 2025
          </h2>
          <p className="text-text-secondary">
            Pinnacle 2025 brings together the brightest IT minds from colleges across the nation for a two-day spectacle of skill, innovation, and competition. 
            From coding challenges and AI innovations to creative tech showcases, there's a platform for every talent. 
            Join us to learn, compete, and network with the best in the field.
          </p>
        </div>
      </section>
    </>
  );
};

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

const InfoCard = ({ icon, title, text }: InfoCardProps) => {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm transition-transform hover:-translate-y-1">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-primary">{title}</h3>
      <p className="text-text-secondary">{text}</p>
    </div>
  );
};
