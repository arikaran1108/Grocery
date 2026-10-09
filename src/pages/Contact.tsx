import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => (
  <div className="container mx-auto px-4 py-16 max-w-4xl">
    <h1 className="font-display text-4xl font-bold text-foreground mb-6">Contact Us</h1>
    <div className="grid md:grid-cols-2 gap-12">
      <div>
        <p className="text-muted-foreground mb-8">Have a question or feedback? We'd love to hear from you.</p>
        <div className="space-y-6">
          {[
            { icon: Mail, label: "Email", value: "arikaran1108@gmail.com" },
            { icon: Phone, label: "Phone", value: "+91 93457 45016" },
            { icon: MapPin, label: "Address", value: "AK Devil Grocery Shop, 32 Egmore, Chennai" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{label}</p>
                <p className="text-muted-foreground text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div>
          <Label htmlFor="contact-name">Name</Label>
          <Input id="contact-name" placeholder="Your name" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" type="email" placeholder="you@example.com" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="contact-message">Message</Label>
          <Textarea id="contact-message" placeholder="How can we help?" className="mt-1" rows={4} />
        </div>
        <button type="submit" className="w-full gradient-hero text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 transition-opacity">
          Send Message
        </button>
      </form>
    </div>
  </div>
);

export default Contact;
