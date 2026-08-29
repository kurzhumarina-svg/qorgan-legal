import { ContactForm } from '@/components/site/contact-form';
import { Faq } from '@/components/site/faq';
import { FloatingContact } from '@/components/site/floating-contact';
import { Hero } from '@/components/site/hero';
import { LeadFormProvider } from '@/components/site/lead-form-context';
import { Process } from '@/components/site/process';
import { Services } from '@/components/site/services';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { Team } from '@/components/site/team';
import { WhyUs } from '@/components/site/why-us';

export default function HomePage() {
  return (
    // Провайдер связывает первый экран и карточки услуг с формой внизу страницы.
    <LeadFormProvider>
      <SiteHeader />
      <main>
        <Hero />
        <Services />
        <Process />
        <Team />
        <WhyUs />
        <Faq />
        <ContactForm />
      </main>
      <SiteFooter />
      <FloatingContact />
    </LeadFormProvider>
  );
}
