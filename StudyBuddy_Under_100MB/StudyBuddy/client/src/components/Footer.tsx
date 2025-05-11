import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#2C3E50] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 font-inter">StudyMate</h3>
            <p className="text-gray-300 mb-4">
              Connecting university students with expert tutors for academic success.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 font-inter">For Students</h3>
            <ul className="space-y-2">
              <li><Link href="#"><a className="text-gray-300 hover:text-white">How It Works</a></Link></li>
              <li><Link href="/tutors"><a className="text-gray-300 hover:text-white">Find Tutors</a></Link></li>
              <li><Link href="#"><a className="text-gray-300 hover:text-white">Student Resources</a></Link></li>
              <li><Link href="#"><a className="text-gray-300 hover:text-white">FAQs</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 font-inter">For Tutors</h3>
            <ul className="space-y-2">
              <li><Link href="/register"><a className="text-gray-300 hover:text-white">Apply as Tutor</a></Link></li>
              <li><Link href="#"><a className="text-gray-300 hover:text-white">Tutor Resources</a></Link></li>
              <li><Link href="#"><a className="text-gray-300 hover:text-white">Payment Info</a></Link></li>
              <li><Link href="#"><a className="text-gray-300 hover:text-white">Success Stories</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 font-inter">Support</h3>
            <ul className="space-y-2">
              <li><Link href="#"><a className="text-gray-300 hover:text-white">Contact Us</a></Link></li>
              <li><Link href="#"><a className="text-gray-300 hover:text-white">Help Center</a></Link></li>
              <li><Link href="#"><a className="text-gray-300 hover:text-white">Terms of Service</a></Link></li>
              <li><Link href="#"><a className="text-gray-300 hover:text-white">Privacy Policy</a></Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-300">
          <p>© {new Date().getFullYear()} StudyMate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
