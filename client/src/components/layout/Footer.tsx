import { Link } from "wouter";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-primary text-2xl font-bold font-inter mb-4">StudyBuddy</h2>
            <p className="text-gray-600 mb-4 max-w-md">
              Connecting university students with peer tutors for academic success. 
              Find the perfect tutor for your specific course needs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-textColor font-inter mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-gray-600 hover:text-primary">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/tutors">
                  <a className="text-gray-600 hover:text-primary">Find Tutors</a>
                </Link>
              </li>
              <li>
                <Link href="/become-tutor">
                  <a className="text-gray-600 hover:text-primary">Become a Tutor</a>
                </Link>
              </li>
              <li>
                <Link href="/how-it-works">
                  <a className="text-gray-600 hover:text-primary">How it Works</a>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <a className="text-gray-600 hover:text-primary">Pricing</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-textColor font-inter mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help">
                  <a className="text-gray-600 hover:text-primary">Help Center</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-gray-600 hover:text-primary">Contact Us</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="text-gray-600 hover:text-primary">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-gray-600 hover:text-primary">Terms of Service</a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-gray-600 hover:text-primary">FAQ</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-center">&copy; {new Date().getFullYear()} StudyBuddy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
