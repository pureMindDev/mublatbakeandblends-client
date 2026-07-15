import React from "react";

import Hero from "../../components/Hero/Hero";
import ChefSpecials from "../../components/ChefSpecials/ChefSpecials";
import LondonFavourite from "../../components/LondonFavourite/LondonFavourite";
import Reviews from "../../components/Reviews/Reviews";

function Home() {

  return (

    <div>

      <Hero />

      <ChefSpecials />

      <LondonFavourite />

      <Reviews />

    </div>

  );
}

export default Home;