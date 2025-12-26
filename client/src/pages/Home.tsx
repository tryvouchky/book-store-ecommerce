import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Utensils, Clock, Star } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-600">THE BOOK BINDERY</h1>
          <div className="flex gap-4 items-center">
            <Link href="/menu">
              <Button variant="ghost">Menu</Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            {user ? (
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            ) : (
              <Button
                onClick={() => window.location.href = '/login'}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="container py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Feel Free for Shopping
              <br />
              <span className="text-orange-600 text-4xl">Low price and best quality</span>
            </h2> 
            <p className="text-xl text-gray-600 mb-8">
              Discover our curated collection of books, from timeless classics to the latest bestsellers.
              Browse effortlessly with personalized recommendations and detailed previews.
              Order now and enjoy your next great read delivered straight to your door.
              Dive into stories that inspire, educate, and entertain – all from the comfort of home.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/menu">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8">
                  <Utensils className="h-5 w-5 mr-2" />
                  Browse Book
                </Button>
              </Link>
              <Link href="/cart">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  View Cart
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="container">
            <h3 className="text-3xl font-bold text-center mb-12">Why Choose 
              The Book Bindery?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils className="h-8 w-8 text-orange-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Best Quality</h4>
                <p className="text-gray-600">
                  We curate the finest books from renowned authors and publishers, ensuring every title is engaging, insightful, and of the highest literary standard.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Fast Delivery</h4>
                <p className="text-gray-600">
                  Our quick and reliable shipping service ensures your books arrive promptly and in perfect condition.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-orange-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Top Rated</h4>
                <p className="text-gray-600">
                  Loved by thousands of customers for our quality and service excellence.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-16 text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to Order?</h3>
          <p className="text-xl text-gray-600 mb-8">
            Browse our menu and add your favorite dishes to the cart
          </p>
          <Link href="/menu">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8">
              Get Started
            </Button>
          </Link>
        </section>
      </main>

      <footer className="bg-white border-t py-8">
        <div className="container text-center text-gray-600">
          <p>&copy; 2025 The Book Bindery. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
