import React, { useState, useEffect } from 'react'
import { supabase, EDGE_FUNCTIONS, TABLES } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Check,
  Crown,
  Zap,
  MessageCircle,
  Calendar,
  Dumbbell,
  Loader2,
  AlertCircle,
  Star
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { FitCraftPlan, FitCraftSubscription } from '@/types'

interface SubscriptionStatus {
  plan: string
  status: string
  aiGenerationsUsed: number
  aiGenerationsLimit: number
  currentPeriodEnd?: string
}

const planFeatures = {
  basic: [
    'AI Workout Generation (50/month)',
    'FitCraft Coach Chat',
    'Basic Calendar Integration',
    'Workout Library Access',
    'Progress Tracking'
  ],
  premium: [
    'AI Workout Generation (200/month)',
    'Advanced FitCraft Coach',
    'Full Calendar Sync',
    'Personalized Meal Plans',
    'Progress Analytics',
    'Priority Support'
  ],
  pro: [
    'Unlimited AI Generation (500/month)',
    'Expert FitCraft Coach',
    'Advanced Calendar Features',
    'Custom Meal Plans',
    'Advanced Analytics',
    'Priority Support',
    'Early Access to New Features'
  ]
}

export default function Subscription() {
  const { user, profile } = useAuth()
  const [plans, setPlans] = useState<FitCraftPlan[]>([])
  const [subscription, setSubscription] = useState<FitCraftSubscription | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribingTo, setSubscribingTo] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchPlansAndSubscription()
    }
  }, [user])

  useEffect(() => {
    // Check for subscription success/cancel in URL
    const urlParams = new URLSearchParams(window.location.search)
    const subscriptionResult = urlParams.get('subscription')
    
    if (subscriptionResult === 'success') {
      toast.success('Subscription activated successfully!')
      window.history.replaceState({}, document.title, window.location.pathname)
      // Refresh subscription data after success
      setTimeout(() => {
        fetchPlansAndSubscription()
      }, 2000)
    } else if (subscriptionResult === 'cancelled') {
      toast.error('Subscription cancelled. You can try again anytime!')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const fetchPlansAndSubscription = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Fetch plans
      const { data: plansData, error: plansError } = await supabase
        .from(TABLES.FITCRAFT_PLANS)
        .select('*')
        .order('price', { ascending: true })

      if (plansError) {
        console.error('Error fetching plans:', plansError)
      } else {
        setPlans(plansData || [])
      }

      // Fetch current subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from(TABLES.FITCRAFT_SUBSCRIPTIONS)
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subscriptionError)
      } else {
        setSubscription(subscriptionData)
        
        if (subscriptionData) {
          // Find the plan details
          const plan = plansData?.find(p => p.price_id === subscriptionData.price_id)
          setSubscriptionStatus({
            plan: plan?.plan_type || 'unknown',
            status: subscriptionData.status,
            aiGenerationsUsed: 0, // This would come from usage tracking
            aiGenerationsLimit: plan?.monthly_limit || 0
          })
        } else {
          // Free plan
          setSubscriptionStatus({
            plan: 'free',
            status: 'active',
            aiGenerationsUsed: 0,
            aiGenerationsLimit: 5
          })
        }
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
      toast.error('Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planType: string) => {
    if (!user) {
      toast.error('Please sign in to subscribe')
      return
    }

    setSubscribingTo(planType)

    try {
      const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.CREATE_SUBSCRIPTION, {
        body: {
          planType,
          customerEmail: user.email
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.data?.checkoutUrl) {
        toast.success('Redirecting to payment...')
        window.location.href = data.data.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Subscription error:', error)
      toast.error(error.message || 'Failed to create subscription')
    } finally {
      setSubscribingTo(null)
    }
  }

  const getPlanPrice = (planType: string): string => {
    const plan = plans.find(p => p.plan_type === planType)
    return plan ? `$${(plan.price / 100).toFixed(2)}` : 'N/A'
  }

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'basic':
        return <Zap className="h-6 w-6 text-blue-500" />
      case 'premium':
        return <Crown className="h-6 w-6 text-purple-500" />
      case 'pro':
        return <Star className="h-6 w-6 text-gold-500" />
      default:
        return <Dumbbell className="h-6 w-6 text-gray-500" />
    }
  }

  const isCurrentPlan = (planType: string): boolean => {
    return subscriptionStatus?.plan === planType
  }

  const getUsageProgress = (): number => {
    if (!subscriptionStatus) return 0
    const { aiGenerationsUsed, aiGenerationsLimit } = subscriptionStatus
    return aiGenerationsLimit > 0 ? (aiGenerationsUsed / aiGenerationsLimit) * 100 : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
            <CardTitle>Loading Subscription</CardTitle>
            <CardDescription>Fetching your plan details...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle>Subscription Management</CardTitle>
            <CardDescription>Please sign in to manage your subscription</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
            <p className="text-gray-600 mt-2">Choose the perfect plan for your fitness journey</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Current Subscription Status */}
        {subscriptionStatus && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Current Plan: {subscriptionStatus.plan.charAt(0).toUpperCase() + subscriptionStatus.plan.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Badge variant={subscriptionStatus.status === 'active' ? 'default' : 'secondary'}>
                    {subscriptionStatus.status.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">Status</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {subscriptionStatus.aiGenerationsUsed} / {subscriptionStatus.aiGenerationsLimit}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">AI Generations Used</p>
                </div>
                <div className="text-center">
                  <div className="w-full">
                    <Progress value={getUsageProgress()} className="h-2 mb-1" />
                    <p className="text-sm text-gray-600">{Math.round(getUsageProgress())}% Used</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <Card className={`relative ${isCurrentPlan('free') ? 'ring-2 ring-blue-500' : ''}`}>
            {isCurrentPlan('free') && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Current Plan
              </Badge>
            )}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4">
                {getPlanIcon('free')}
              </div>
              <CardTitle className="text-2xl">Free</CardTitle>
              <div className="text-3xl font-bold">$0</div>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">5 AI Workouts/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Basic FitCraft Chat</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Exercise Library</span>
                </li>
              </ul>
              <Button 
                className="w-full" 
                variant={isCurrentPlan('free') ? 'outline' : 'default'}
                disabled={isCurrentPlan('free')}
              >
                {isCurrentPlan('free') ? 'Current Plan' : 'Start Free'}
              </Button>
            </CardContent>
          </Card>

          {/* Basic Plan */}
          <Card className={`relative ${isCurrentPlan('basic') ? 'ring-2 ring-blue-500' : ''}`}>
            {isCurrentPlan('basic') && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Current Plan
              </Badge>
            )}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4">
                {getPlanIcon('basic')}
              </div>
              <CardTitle className="text-2xl">FitCraft Basic</CardTitle>
              <div className="text-3xl font-bold">{getPlanPrice('basic')}<span className="text-lg font-normal">/month</span></div>
              <CardDescription>Enhanced AI-powered fitness</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {planFeatures.basic.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full" 
                variant={isCurrentPlan('basic') ? 'outline' : 'default'}
                disabled={subscribingTo === 'basic' || isCurrentPlan('basic')}
                onClick={() => handleSubscribe('basic')}
              >
                {subscribingTo === 'basic' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isCurrentPlan('basic') ? (
                  'Current Plan'
                ) : (
                  'Subscribe to Basic'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className={`relative ${isCurrentPlan('premium') ? 'ring-2 ring-purple-500' : ''}`}>
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500">
              {isCurrentPlan('premium') ? 'Current Plan' : 'Popular'}
            </Badge>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4">
                {getPlanIcon('premium')}
              </div>
              <CardTitle className="text-2xl">FitCraft Premium</CardTitle>
              <div className="text-3xl font-bold">{getPlanPrice('premium')}<span className="text-lg font-normal">/month</span></div>
              <CardDescription>Advanced fitness optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {planFeatures.premium.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-purple-500 hover:bg-purple-600" 
                disabled={subscribingTo === 'premium' || isCurrentPlan('premium')}
                onClick={() => handleSubscribe('premium')}
              >
                {subscribingTo === 'premium' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isCurrentPlan('premium') ? (
                  'Current Plan'
                ) : (
                  'Subscribe to Premium'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={`relative ${isCurrentPlan('pro') ? 'ring-2 ring-yellow-500' : ''} md:col-start-2`}>
            {isCurrentPlan('pro') && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-500">
                Current Plan
              </Badge>
            )}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4">
                {getPlanIcon('pro')}
              </div>
              <CardTitle className="text-2xl">FitCraft Pro</CardTitle>
              <div className="text-3xl font-bold">{getPlanPrice('pro')}<span className="text-lg font-normal">/month</span></div>
              <CardDescription>Ultimate fitness experience</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {planFeatures.pro.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black" 
                disabled={subscribingTo === 'pro' || isCurrentPlan('pro')}
                onClick={() => handleSubscribe('pro')}
              >
                {subscribingTo === 'pro' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isCurrentPlan('pro') ? (
                  'Current Plan'
                ) : (
                  'Subscribe to Pro'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change my plan anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at your next billing cycle.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens if I exceed my AI generation limit?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">You'll be notified when you're close to your limit. You can upgrade your plan or wait for the next billing cycle for your limit to reset.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}