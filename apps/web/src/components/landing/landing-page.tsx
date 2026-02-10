"use client"

import {
  Bot,
  MessageSquare,
  FileText,
  Shield,
  Zap,
  Clock,
  BookOpen,
  ArrowRight,
  Search,
} from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <span className="text-base font-bold text-primary-foreground">S</span>
            </div>
            <div>
              <span className="text-base font-semibold text-foreground">Shinhan AI</span>
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                Assistant
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="max-w-xl">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              AI-Powered Internal Assistant
            </span>
          </div>
          <h1 className="text-4xl font-bold text-foreground leading-tight text-balance lg:text-5xl">
            Your Smart
            <br />
            <span className="text-primary">Knowledge Assistant</span>
          </h1>
          <p className="mt-5 text-base text-muted-foreground leading-relaxed max-w-lg">
            Get instant answers about company policies, guidelines, and procedures.
            Our AI assistant reads and understands internal documents so you
            don't have to search through them manually.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              Click the chat bubble in the bottom-right to get started
            </span>
          </div>
        </div>
      </section>

      {/* What it does */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="text-lg font-semibold text-foreground mb-2">What can it do?</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-lg">
          Ask anything about your company's internal documents and get accurate, sourced answers in seconds.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={<MessageSquare className="h-5 w-5" />}
            title="Natural Conversations"
            desc="Chat naturally like talking to a colleague. Ask follow-up questions and get contextual responses."
          />
          <FeatureCard
            icon={<Search className="h-5 w-5" />}
            title="Smart Document Search"
            desc="The assistant searches through all uploaded documents to find the most relevant information for your question."
          />
          <FeatureCard
            icon={<BookOpen className="h-5 w-5" />}
            title="Source References"
            desc="Every answer includes references to the original documents so you can verify and read more."
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="Instant Responses"
            desc="Get answers in real-time with streaming responses. No waiting for long processing times."
          />
          <FeatureCard
            icon={<Shield className="h-5 w-5" />}
            title="Secure & Private"
            desc="All data stays within your network. Nothing is sent to external servers. Your information is safe."
          />
          <FeatureCard
            icon={<Clock className="h-5 w-5" />}
            title="Available 24/7"
            desc="Get answers anytime, even outside of business hours. No need to wait for a colleague to respond."
          />
        </div>
      </section>

      {/* Example questions */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="text-lg font-semibold text-foreground mb-2">Try asking about</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Here are some example topics you can ask the assistant about.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <ExampleCard
            icon={<FileText className="h-4 w-4" />}
            category="Leave Policy"
            question="How many annual leave days do I get per year?"
          />
          <ExampleCard
            icon={<FileText className="h-4 w-4" />}
            category="Salary & Benefits"
            question="When is the monthly salary payment date?"
          />
          <ExampleCard
            icon={<FileText className="h-4 w-4" />}
            category="IT Security"
            question="What is the password policy for company accounts?"
          />
          <ExampleCard
            icon={<FileText className="h-4 w-4" />}
            category="Onboarding"
            question="What should I prepare on my first day at work?"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="text-lg font-semibold text-foreground mb-2">How it works</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-lg">
          Simple 3-step process to get the answers you need.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <StepCard
            step={1}
            title="Ask a question"
            desc="Type your question in natural language, just like messaging a friend."
          />
          <StepCard
            step={2}
            title="AI searches documents"
            desc="The assistant finds the most relevant sections from company documents."
          />
          <StepCard
            step={3}
            title="Get your answer"
            desc="Receive a clear, accurate answer with references to the source documents."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Shinhan AI Assistant - Internal Knowledge Base
          </p>
          <div className="flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Powered by Local AI</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/20">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}

function ExampleCard({
  icon,
  category,
  question,
}: {
  icon: React.ReactNode
  category: string
  question: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/20">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-medium text-primary uppercase tracking-wide">{category}</p>
        <p className="mt-0.5 text-sm text-foreground leading-snug">{question}</p>
      </div>
    </div>
  )
}

function StepCard({
  step,
  title,
  desc,
}: {
  step: number
  title: string
  desc: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3">
        {step}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}
