import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, ArrowRight, ArrowLeft, User, Activity, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const bodyTypes = {
  ectomorph: {
    name: 'Ectomorph',
    icon: <User className="h-6 w-6" />,
    description: 'Naturally lean with fast metabolism',
    characteristics: [
      'Narrow shoulders and hips',
      'Long limbs and lean muscle mass',
      'Fast metabolism',
      'Difficulty gaining weight',
      'Low body fat percentage'
    ],
    workoutFocus: [
      'Strength training with compound movements',
      'Shorter, intense workouts',
      'Focus on progressive overload',
      'Minimal cardio to preserve muscle'
    ],
    nutritionTips: [
      'Higher calorie intake needed',
      'Focus on protein and healthy fats',
      'Frequent meals throughout the day',
      'Post-workout nutrition is crucial'
    ],
    color: 'bg-blue-500'
  },
  mesomorph: {
    name: 'Mesomorph',
    icon: <Activity className="h-6 w-6" />,
    description: 'Athletic build with balanced metabolism',
    characteristics: [
      'Naturally muscular and athletic',
      'Broad shoulders, narrow waist',
      'Gains muscle easily',
      'Moderate metabolism',
      'Responds well to training'
    ],
    workoutFocus: [
      'Balanced strength and cardio',
      'Variety in training methods',
      'Can handle higher volume',
      'Mix of compound and isolation exercises'
    ],
    nutritionTips: [
      'Balanced macronutrient approach',
      'Moderate calorie intake',
      'Timing nutrients around workouts',
      'Can be more flexible with diet'
    ],
    color: 'bg-green-500'
  },
  endomorph: {
    name: 'Endomorph',
    icon: <Zap className="h-6 w-6" />,
    description: 'Curvier build with slower metabolism',
    characteristics: [
      'Wider hips and shoulders',
      'Higher body fat percentage',
      'Slower metabolism',
      'Gains weight easily',
      'Stores fat more readily'
    ],
    workoutFocus: [
      'Higher intensity cardio',
      'Circuit training and HIIT',
      'Strength training for muscle preservation',
      'Longer, more frequent sessions'
    ],
    nutritionTips: [
      'Lower carbohydrate approach',
      'Higher protein intake',
      'Portion control important',
      'Focus on whole, unprocessed foods'
    ],
    color: 'bg-purple-500'
  }
}

const BodyTypeChat = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedType, setSelectedType] = useState(null)
  const [confidence, setConfidence] = useState(0)

  const steps = [
    'introduction',
    'education',
    'assessment',
    'confirmation'
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    onComplete({
      bodyType: selectedType,
      confidence: confidence
    })
  }

  const renderIntroduction = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Understanding Your Body Type</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your body type (somatotype) influences how you respond to exercise and nutrition. 
          Understanding your body type helps us create the most effective workout plan for you.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {Object.entries(bodyTypes).map(([key, type]) => (
          <Card key={key} className="text-center">
            <CardHeader>
              <div className={`w-12 h-12 rounded-full ${type.color} flex items-center justify-center text-white mx-auto mb-2`}>
                {type.icon}
              </div>
              <CardTitle className="text-lg">{type.name}</CardTitle>
              <CardDescription>{type.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Button onClick={handleNext} className="mt-6">
        Learn More <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.div>
  )

  const renderEducation = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Body Type Characteristics</h2>
        <p className="text-muted-foreground">
          Each body type has unique characteristics that affect training and nutrition
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(bodyTypes).map(([key, type]) => (
          <Card key={key}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full ${type.color} flex items-center justify-center text-white`}>
                  {type.icon}
                </div>
                <div>
                  <CardTitle>{type.name}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Physical Characteristics:</h4>
                <div className="flex flex-wrap gap-2">
                  {type.characteristics.map((char, index) => (
                    <Badge key={index} variant="secondary">{char}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Workout Focus:</h4>
                  <ul className="text-sm space-y-1">
                    {type.workoutFocus.map((focus, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{focus}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Nutrition Tips:</h4>
                  <ul className="text-sm space-y-1">
                    {type.nutritionTips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleNext}>
          Take Assessment <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )

  const renderAssessment = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Which Body Type Describes You Best?</h2>
        <p className="text-muted-foreground">
          Based on what you've learned, select the body type that most closely matches your characteristics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(bodyTypes).map(([key, type]) => (
          <Card 
            key={key} 
            className={`cursor-pointer transition-all ${
              selectedType === key 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedType(key)}
          >
            <CardHeader className="text-center">
              <div className={`w-12 h-12 rounded-full ${type.color} flex items-center justify-center text-white mx-auto mb-2`}>
                {type.icon}
              </div>
              <CardTitle className="text-lg">{type.name}</CardTitle>
              <CardDescription>{type.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Key traits:</h4>
                <ul className="text-xs space-y-1">
                  {type.characteristics.slice(0, 3).map((char, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-current rounded-full" />
                      <span>{char}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedType && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              How confident are you in this selection?
            </p>
            <div className="space-y-2">
              <Progress value={confidence} className="w-full max-w-md mx-auto" />
              <div className="flex justify-between text-xs text-muted-foreground max-w-md mx-auto">
                <span>Not sure</span>
                <span>Very confident</span>
              </div>
            </div>
            <div className="flex justify-center space-x-2 mt-4">
              {[25, 50, 75, 100].map((value) => (
                <Button
                  key={value}
                  variant={confidence === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setConfidence(value)}
                >
                  {value}%
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!selectedType || confidence === 0}
        >
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )

  const renderConfirmation = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="space-y-4">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold">Perfect! You're a {bodyTypes[selectedType]?.name}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Based on your selection, we'll create personalized workouts that are optimized for your 
          {' '}{bodyTypes[selectedType]?.name.toLowerCase()} body type. This means better results 
          and more effective training sessions.
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className={`w-12 h-12 rounded-full ${bodyTypes[selectedType]?.color} flex items-center justify-center text-white mx-auto mb-2`}>
            {bodyTypes[selectedType]?.icon}
          </div>
          <CardTitle>{bodyTypes[selectedType]?.name}</CardTitle>
          <CardDescription>{bodyTypes[selectedType]?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <p className="mb-2"><strong>Confidence Level:</strong> {confidence}%</p>
            <p className="text-muted-foreground">
              Don't worry - you can always update this later as you learn more about your body's response to training.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleComplete}>
          Complete Setup <CheckCircle className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Body Type Assessment</h1>
          <Badge variant="outline">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        <Progress value={(currentStep + 1) / steps.length * 100} className="w-full" />
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 0 && renderIntroduction()}
        {currentStep === 1 && renderEducation()}
        {currentStep === 2 && renderAssessment()}
        {currentStep === 3 && renderConfirmation()}
      </AnimatePresence>
    </div>
  )
}

export default BodyTypeChat

