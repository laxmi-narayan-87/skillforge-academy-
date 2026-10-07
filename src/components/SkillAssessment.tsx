import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Award, Star, GraduationCap, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface SkillAssessmentProps {
  topic: string;
  questions: Question[];
  onComplete?: (skillLevel: "beginner" | "intermediate" | "advanced") => void;
}

export const SkillAssessment = ({ topic, questions, onComplete }: SkillAssessmentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  if (questions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-xl font-bold mb-4">No assessment available</h3>
        <Button onClick={() => onComplete?.("beginner")}>Complete Topic</Button>
      </Card>
    );
  }

  const handleAnswer = (selectedAnswer: number) => {
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    const nextScore = score + (isCorrect ? 1 : 0);
    const isLastQuestion = currentQuestion === questions.length - 1;

    setScore(nextScore);

    toast({
      title: isCorrect ? "Correct! 🎉" : "Not quite right",
      description: isCorrect
        ? "Great job on this question!"
        : "Keep practicing and review the topic.",
      variant: isCorrect ? "default" : "destructive",
    });

    if (isLastQuestion) {
      setShowResults(true);
      return;
    }

    setCurrentQuestion((question) => question + 1);
  };

  const restart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
  };

  const getSkillLevel = () => {
    const percentage = (score / questions.length) * 100;

    if (percentage >= 80) {
      return { text: "Expert", level: "advanced" as const, icon: Award };
    }

    if (percentage >= 60) {
      return { text: "Intermediate", level: "intermediate" as const, icon: Star };
    }

    return { text: "Beginner", level: "beginner" as const, icon: GraduationCap };
  };

  if (showResults) {
    const skillLevel = getSkillLevel();
    const SkillIcon = skillLevel.icon;
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <Card className="border-0 p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <SkillIcon className="h-8 w-8 text-primary" />
          </div>
          <p className="mb-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {topic}
          </p>
          <h3 className="text-2xl font-bold">Assessment Complete</h3>
          <p className="mt-2 text-muted-foreground">
            You scored {score} out of {questions.length}
          </p>
        </div>

        <div className="my-6 rounded-xl border bg-muted/30 p-5 text-center">
          <div className="text-4xl font-bold">{percentage}%</div>
          <div className="mt-1 text-sm text-muted-foreground">Assessment score</div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            <SkillIcon className="h-4 w-4" />
            {skillLevel.text}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={restart}>
            Retake Assessment
          </Button>
          <Button className="flex-1" onClick={() => onComplete?.(skillLevel.level)}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Complete Topic
          </Button>
        </div>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="border-0 p-6 sm:p-8">
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-4 text-sm">
          <div>
            <p className="font-semibold text-primary">Skill Assessment</p>
            <p className="mt-1 text-muted-foreground">{topic}</p>
          </div>
          <span className="shrink-0 font-medium text-muted-foreground">
            {currentQuestion + 1} / {questions.length}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="mb-7">
        <h3 className="text-xl font-bold leading-8">{question.text}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose the best answer to continue.
        </p>
      </div>

      <div className="grid gap-3">
        {question.options.map((option, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto min-h-12 w-full justify-start whitespace-normal px-4 py-3 text-left"
            onClick={() => handleAnswer(index)}
          >
            <span className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              {String.fromCharCode(65 + index)}
            </span>
            <span>{option}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
};
