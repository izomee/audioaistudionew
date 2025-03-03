'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft size={16} />
            <span>Back to Audio AI Studio</span>
          </Link>
          
          <div className="ai-card">
            <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-sm text-muted-foreground mb-6">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
              <p>
                Welcome to Audio AI Studio. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you about how we handle your data and your privacy rights.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">2. Data Processing in the Browser</h2>
              <p>
                Audio AI Studio processes all audio files directly in your browser using client-side technologies. 
                Your audio files are never uploaded to our servers, and we do not have access to or knowledge of the content of your audio files.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">3. Data We Collect</h2>
              <p>
                We collect minimal data necessary for the functioning of our service:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>
                  <strong>Local Storage:</strong> We use browser local storage to save your preferences, such as cookie consent. 
                  This data remains on your device and is not transmitted to our servers.
                </li>
                <li>
                  <strong>Anonymous Usage Data:</strong> We may collect anonymous usage statistics to improve our service, 
                  such as the number of visitors to our website. This data is aggregated and cannot be used to identify you.
                </li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">4. Your Rights Under GDPR</h2>
              <p>
                Under the General Data Protection Regulation (GDPR), you have the following rights:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>The right to access your personal data</li>
                <li>The right to rectification of inaccurate personal data</li>
                <li>The right to erasure of your personal data</li>
                <li>The right to restrict processing of your personal data</li>
                <li>The right to data portability</li>
                <li>The right to object to processing of your personal data</li>
                <li>The right not to be subject to automated decision-making, including profiling</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at privacy@audioaistudio.com.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">5. Cookies</h2>
              <p>
                We use only essential cookies that are necessary for the functioning of our website. 
                These cookies do not track you for advertising purposes. You can control cookies through your browser settings.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">6. Data Security</h2>
              <p>
                We have implemented appropriate technical and organizational measures to ensure a level of security appropriate to the risk, 
                including:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Client-side processing of all audio files</li>
                <li>No server-side storage of your audio content</li>
                <li>Secure HTTPS connections</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">7. Children's Privacy</h2>
              <p>
                Our service is not intended for children under 16 years of age. We do not knowingly collect personal data from children under 16. 
                If you are a parent or guardian and believe your child has provided us with personal data, please contact us.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
              <p>
                We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page 
                and updating the "Last updated" date.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">9. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our data practices, please contact us at:
              </p>
              <p className="mb-4">
                Email: privacy@audioaistudio.com
              </p>
              <p>
                Audio AI Studio<br />
                Musterstraße 123<br />
                10115 Berlin<br />
                Germany
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">10. Legal Basis for Processing</h2>
              <p>
                In accordance with the GDPR and German data protection laws, we process your data based on the following legal grounds:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Your consent (Art. 6(1)(a) GDPR)</li>
                <li>Performance of a contract (Art. 6(1)(b) GDPR)</li>
                <li>Compliance with a legal obligation (Art. 6(1)(c) GDPR)</li>
                <li>Legitimate interests (Art. 6(1)(f) GDPR)</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">11. Data Protection Officer</h2>
              <p>
                Our Data Protection Officer can be contacted at:
              </p>
              <p>
                Email: dpo@audioaistudio.com
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">12. Supervisory Authority</h2>
              <p>
                If you are a resident of the European Economic Area (EEA) and believe we are processing your personal data unlawfully, 
                you have the right to lodge a complaint with your local data protection supervisory authority. 
                In Germany, this is the Bundesbeauftragter für den Datenschutz und die Informationsfreiheit (BfDI).
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 