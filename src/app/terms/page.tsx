'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft size={16} />
            Back to Audio AI Studio
          </Link>
          
          <div className="ai-card mb-8">
            <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
            
            <div className="prose prose-sm prose-invert max-w-none">
              <h2>1. Introduction</h2>
              <p>Welcome to Audio AI Studio. These Terms of Service ("Terms") govern your use of our website located at audioaistudio.com (the "Service") operated by Audio AI Studio ("us", "we", or "our").</p>
              <p>By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.</p>
              
              <h2>2. Use of the Service</h2>
              <p>Audio AI Studio provides an online platform for modifying audio files. All audio processing happens in your browser, and we do not store or have access to your audio files.</p>
              <p>You are responsible for ensuring that your use of the Service complies with all applicable laws, including copyright laws. You may not use the Service to process audio files that you do not have the legal right to modify.</p>
              
              <h2>3. Intellectual Property</h2>
              <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Audio AI Studio and its licensors. The Service is protected by copyright, trademark, and other laws of both Germany and foreign countries.</p>
              <p>Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Audio AI Studio.</p>
              
              <h2>4. User Content</h2>
              <p>You retain all rights to your audio files. We do not claim ownership over the audio files you process using our Service.</p>
              <p>You are solely responsible for the audio files you process using our Service and for ensuring that you have the legal right to modify such files.</p>
              
              <h2>5. Limitation of Liability</h2>
              <p>In no event shall Audio AI Studio, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
              
              <h2>6. Governing Law</h2>
              <p>These Terms shall be governed and construed in accordance with the laws of Germany, without regard to its conflict of law provisions.</p>
              <p>Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.</p>
              
              <h2>7. Changes to Terms</h2>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
              <p>By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.</p>
              
              <h2>8. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us at legal@audioaistudio.com.</p>
              
              <p className="text-sm text-muted-foreground mt-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 