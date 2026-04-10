const About = () => (
  <div className="container mx-auto px-4 py-16 max-w-3xl">
    <h1 className="font-display text-4xl font-bold text-foreground mb-6">About FreshCart</h1>
    <p className="text-muted-foreground leading-relaxed mb-6">
      FreshCart is your neighborhood grocery delivery service, bringing farm-fresh produce and daily essentials straight to your doorstep. We partner with local farmers and trusted suppliers to ensure you get the freshest quality every single time.
    </p>
    <div className="grid sm:grid-cols-3 gap-6 my-12">
      {[
        { stat: "10K+", label: "Happy Customers" },
        { stat: "500+", label: "Products Available" },
        { stat: "30 min", label: "Average Delivery" },
      ].map(({ stat, label }) => (
        <div key={label} className="bg-accent rounded-lg p-6 text-center">
          <p className="font-display text-3xl font-bold text-primary">{stat}</p>
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </div>
      ))}
    </div>
    <h2 className="font-display text-2xl font-bold text-foreground mb-4">Our Mission</h2>
    <p className="text-muted-foreground leading-relaxed">
      We believe everyone deserves access to fresh, high-quality groceries without the hassle of traditional shopping. Our platform connects you with the best local produce while supporting sustainable farming practices.
    </p>
  </div>
);

export default About;
