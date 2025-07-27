import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Lock, ShieldCheck, Headset, Smartphone, ShoppingCart, RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-lg rounded-lg">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="flex justify-center mb-2">
            <Smartphone className="h-16 w-16 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">MB.PONSEL</CardTitle>
          <p className="text-sm text-gray-600">Service & Toko Handphone Terpercaya</p>
          <div className="flex justify-center space-x-4 text-gray-500 text-sm">
            <div className="flex items-center gap-1">
              <Smartphone className="h-4 w-4" /> Service
            </div>
            <div className="flex items-center gap-1">
              <ShoppingCart className="h-4 w-4" /> Penjualan
            </div>
            <div className="flex items-center gap-1">
              <RefreshCcw className="h-4 w-4" /> Trade-in
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="sr-only">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="username" type="text" placeholder="Username" className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            <div>
              <Label htmlFor="password" className="sr-only">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="password" type="password" placeholder="Password" className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="remember-me" />
            <Label htmlFor="remember-me" className="text-sm text-gray-700">Ingat Saya</Label>
          </div>
          <Link to="/dashboard"> {/* Temporarily link to dashboard */}
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-lg font-semibold transition-colors duration-200">
              Masuk ke Sistem
            </Button>
          </Link>
          <div className="flex justify-around text-xs text-gray-500 mt-6">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Sistem Aman
            </div>
            <div className="flex items-center gap-1">
              <Headset className="h-3 w-3" /> 24/7 Support
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            © 2024 MB.PONSEL - management system
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;