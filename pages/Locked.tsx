import React, { useState } from 'react';
import { ShieldAlert, Send, ArrowLeft } from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Locked: React.FC = () => {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/support/request-unlock', { email, reason });
      setSubmitted(true);
      toast.success('Appeal submitted successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit appeal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-900 p-4">
      <Card className="max-w-lg w-full border-cyber-danger shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <div className="flex flex-col items-center text-center mb-6">
          <ShieldAlert className="w-16 h-16 text-cyber-danger mb-4" />
          <h1 className="text-3xl font-bold text-white">Account Locked</h1>
          <p className="text-gray-400 mt-2">
            Our AI systems have detected suspicious activity. Your account has been temporarily frozen for your protection.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <h3 className="text-xl text-cyber-success mb-2">Appeal Submitted</h3>
            <p className="text-gray-400 mb-6">Our security team will review your request shortly.</p>
            <Link to="/">
              <Button variant="outline" className="w-full">Return Home</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
            />
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-400">Reason for Appeal</label>
              <textarea 
                className="w-full bg-cyber-800 border border-cyber-700 text-white rounded-lg px-4 py-2 focus:border-cyber-cyan focus:outline-none min-h-[100px]"
                placeholder="Explain why this lock is a mistake..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="danger" className="w-full" isLoading={loading}>
              <Send className="w-4 h-4" /> Submit Appeal
            </Button>
            <Link to="/login">
              <Button type="button" variant="ghost" className="w-full mt-2">Back to Login</Button>
            </Link>
          </form>
        )}
      </Card>
    </div>
  );
};

export default Locked;