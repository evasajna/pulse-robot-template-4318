import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import indianFlag from "@/assets/indian-flag.jpg";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={indianFlag} 
              alt="Indian Flag" 
              className="h-8 w-12 rounded object-cover"
            />
            <Link to="/" className="text-xl font-bold text-primary">
              ക്വിസ് സിസ്റ്റം
            </Link>
          </div>
          <Link to="/admin">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>അഡ്മിൻ ലോഗിൻ</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;