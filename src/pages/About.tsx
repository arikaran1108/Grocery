const About = () => (
  <div className="container mx-auto px-4 py-16 max-w-3xl">
    <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 text-center sm:text-left">
      <img
        src="/logo.jpg"
        alt="AK Devil Grocery Shop Logo"
        className="w-24 h-24 rounded-2xl object-cover shadow-elevated border border-border"
      />
      <div>
        <h1 className="font-display text-4xl font-bold text-foreground">About AK DEVIL</h1>
        <p className="text-primary font-semibold tracking-wide uppercase text-sm mt-1">
          Grocery Shop • Good Food • Better Life
        </p>
      </div>
    </div>
    <p className="text-muted-foreground leading-relaxed mb-6">
      AK Devil Grocery Shop is your premier neighborhood grocery delivery service, bringing farm-fresh produce and daily essentials straight to your doorstep. We partner with local farmers and trusted suppliers to ensure you get the freshest quality every single time.
    </p>
    <div className="grid sm:grid-cols-4 gap-4 my-8">
      {[
        { label: "Fresh Produce" },
        { label: "Daily Essentials" },
        { label: "Dairy & Beverages" },
        { label: "Snacks & More" },
      ].map(({ label }) => (
        <div key={label} className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">{label}</span>
        </div>
      ))}
    </div>
    <div className="grid sm:grid-cols-3 gap-6 my-10">
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
      At AK Devil Grocery Shop, we believe everyone deserves access to fresh, high-quality groceries without the hassle of traditional shopping. Our platform connects you with the best local produce while ensuring swift, reliable deliveries.
    </p>
  </div>
);

export default About;
