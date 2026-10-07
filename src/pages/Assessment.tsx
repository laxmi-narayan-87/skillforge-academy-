import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Award, ArrowLeft, ClipboardCheck, GraduationCap, RotateCcw, Save, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { frontendAssessment } from "@/data/assessments/frontend";

const skillMeta = (score: number, total: number) => {
  const percentage = Math.round((score / total) * 100);

  if (percentage >= 80) {
    return { label: "Advanced", icon: Award, description: "You have a strong frontend foundation." };
  }

  if (percentage >= 60) {
    return { label: "Intermediate", icon: Star, description: "You have a solid foundation with a few areas to strengthen." };
  }

  return { label: "Beginner", icon: GraduationCap, description: "Use the roadmap to build the fundamentals step by step." };
};

const Assessment = () => {
  const { roadmapId } = useParams();
  const { toast } = useToast();
  const isFrontend = roadmapId === "frontend";

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const question = frontendAssessment[currentQuestion];

  const percentage = useMemo(
    () => Math.round(((currentQuestion + 1) / frontendAssessment.length) * 100),
    [currentQuestion],
  );

  const finishAssessment = (nextScore: number) => {
    setScore(nextScore);
    setCompleted(true);
  };

  const handleAnswer = (selectedAnswer: number) => {
    if (!question || answers[question.id] !== undefined) return;

    const nextAnswers = { ...answers, [question.id]: selectedAnswer };
    const nextScore = nextAnswerScore(nextAnswers);

    setAnswers(nextAnswers);

    if (currentQuestion === frontendAssessment.length - 1) {
      finishAssessment(nextScore);
      return;
    }

    setCurrentQuestion((index) => index + 1);
  };

  const nextAnswerScore = (nextAnswers: Record<number, number>) => {
    let total = 0;

    frontendAssessment.forEach((item) => {
      if (nextAnswers[item.id] === item.correctAnswer) {
        total += 1;
      }
    });

    return total;
  };

  const saveResult = async () => {
    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Sign in to save your result",
          description: "Your assessment is complete. Sign in to keep the score in your account.",
        });
        return;
      }

      const meta = skillMeta(score, frontendAssessment.length);

      const { error } = await supabase.from("assessment_results").insert({
        user_id: user.id,
        roadmap_key: "frontend",
        score,
        total_questions: frontendAssessment.length,
        skill_level: meta.label.toLowerCase(),
        answers: answers,
      });

      if (error) throw error;

      toast({
        title: "Assessment saved",
        description: "Your Frontend assessment result is now in your account.",
      });
    } catch (error) {
      toast({
        title: "Could not save assessment",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const restart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setAnswers({});
    setCompleted(false);
  };

  if (!isFrontend) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto flex min-h-screen max-w-2xl items-center px-4 py-12">
          <Card className="w-full p-8 text-center">
            <ClipboardCheck className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold">Assessment not available</h1>
            <p className="mt-2 text-muted-foreground">
              The dedicated assessment module is currently available for the Frontend Developer roadmap.
            </p>
            <Button asChild className="mt-6">
              <Link to="/roadmap/frontend">Back to Frontend Roadmap</Link>
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  if (completed) {
    const meta = skillMeta(score, frontendAssessment.length);
    const Icon = meta.icon;
    const resultPercentage = Math.round((score / frontendAssessment.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <main className="container mx-auto max-w-3xl px-4 py-10 sm:py-16">
          <Link to="/roadmap/frontend" className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Frontend Roadmap
          </Link>

          <Card className="p-6 sm:p-10">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-9 w-9 text-primary" />
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Assessment Complete
              </p>
              <h1 className="mt-2 text-3xl font-bold">Frontend Developer</h1>
              <p className="mx-auto mt-2 max-w-xl text-muted-foreground">{meta.description}</p>
            </div>

            <div className="my-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border p-5 text-center">
                <div className="text-3xl font-bold">{resultPercentage}%</div>
                <div className="mt-1 text-sm text-muted-foreground">Score</div>
              </div>
              <div className="rounded-xl border p-5 text-center">
                <div className="text-3xl font-bold">{score}/{frontendAssessment.length}</div>
                <div className="mt-1 text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="rounded-xl border p-5 text-center">
                <div className="text-xl font-bold capitalize">{meta.label}</div>
                <div className="mt-1 text-sm text-muted-foreground">Skill level</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={restart}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Assessment
              </Button>
              <Button className="flex-1" onClick={saveResult} disabled={saving}>
                {saving ? "Saving..." : "Save Result"}
                {!saving && <Save className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <Link to="/roadmap/frontend" className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Frontend Roadmap
        </Link>

        <Card className="overflow-hidden">
          <div className="border-b bg-background p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                  Frontend Developer
                </p>
                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Frontend Skill Assessment</h1>
                <p className="mt-2 text-muted-foreground">
                  Test your fundamentals across HTML, CSS, JavaScript, React, performance, accessibility, and testing.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Question {currentQuestion + 1} of {frontendAssessment.length}</span>
                <span className="text-muted-foreground">{percentage}%</span>
              </div>
              <Progress value={percentage} />
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-2 text-sm font-medium text-primary">{question.topic}</div>
            <h2 className="text-xl font-bold leading-8 sm:text-2xl">{question.text}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Choose one answer to continue.</p>

            <div className="mt-7 grid gap-3">
              {question.options.map((option, index) => (
                <Button
                  key={option}
                  variant="outline"
                  className="h-auto min-h-14 w-full justify-start whitespace-normal px-4 py-3 text-left"
                  onClick={() => handleAnswer(index)}
                >
                  <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Assessment;
