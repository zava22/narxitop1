import { useState } from "react";

import Navbar from "../components/layout/Navbar";
import Hero from "../components/home/Hero";
import CategoryNav from "../components/home/CategoryNav";
import ProductsSection from "../components/products/ProductsSection";
import Footer from "../components/layout/Footer";

import { ALL_CATEGORIES } from "../lib/constants";
import useReveal from "../hooks/useReveal";

export default function Home() {
  const [selectedCategory, setSelectedCategory] =
    useState(ALL_CATEGORIES);

  useReveal([selectedCategory]);

  return (
    <div className="home-page">
      <Navbar />

      <main className="main-content">
        <Hero />

        <CategoryNav
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <ProductsSection
          selectedCategory={selectedCategory}
        />
      </main>

      <Footer />
    </div>
  );
}