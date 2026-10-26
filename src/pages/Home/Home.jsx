import React from "react";

import Hero from "../../components/Hero/Hero";
import ChefSpecials from "../../components/ChefSpecials/ChefSpecials";
import LondonFavourite from "../../components/LondonFavourite/LondonFavourite";
import Reviews from "../../components/Reviews/Reviews";
import VideoReviews from "../../components/VideoReviews/VideoReviews";

function Home() {

  return (

    <div>

      <Hero />

      <ChefSpecials />

      <LondonFavourite />

      <VideoReviews variant="home" />

      <Reviews />

    </div>

  );
}

export default Home;