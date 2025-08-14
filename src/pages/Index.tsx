import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ShareLinkGenerator from "@/components/ShareLinkGenerator";
import indianFlag from "@/assets/indian-flag.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <Navbar />
      
      {/* Hero Section with Indian Theme */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8 relative">
            <img 
              src={indianFlag} 
              alt="Indian Flag" 
              className="w-32 h-20 mx-auto mb-6 rounded-lg shadow-lg"
            />
            <h1 className="text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-gray-800 to-green-600">
              ക്വിസ് പ്രോഗ്രാം
            </h1>
            <p className="text-2xl text-gray-700 mb-12 font-medium">
              നിങ്ങളുടെ അറിവ് പരീക്ഷിക്കാനുള്ള സമയമായി
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-200 via-white to-green-200 rounded-2xl blur-3xl opacity-30"></div>
            <Link to="/quiz" className="relative block">
              <Button 
                size="lg" 
                className="relative px-16 py-6 text-xl font-bold bg-gradient-to-r from-orange-500 via-gray-800 to-green-600 hover:from-orange-600 hover:via-gray-900 hover:to-green-700 text-white shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                ക്വിസ് എടുക്കുക
              </Button>
            </Link>
          </div>
          
          {/* Share Link Generator Section */}
          <ShareLinkGenerator />
        </div>
      </div>
    </div>
  );
};

export default Index;
