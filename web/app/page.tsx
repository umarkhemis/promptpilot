import Navbar from './Navbar';
import Hero from './Hero';
import SocialProof from './SocialProof';
import Features from './Features';
import HowItWorks from './HowItWorks';
import BeforeAfter from './BeforeAfter';
import TwoModes from './TwoModes';
import Testimonials from './Testimonials';
import FinalCta from './FinalCta';
import Footer from './Footer';
// import Pricing from './Pricing';

const Page = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <SocialProof />
            <Features />
            <HowItWorks />
            <BeforeAfter />
            <TwoModes />
            <Testimonials />
            {/* <Pricing /> */}
            <FinalCta />
            <Footer />
        </>
    );
};

export default Page;