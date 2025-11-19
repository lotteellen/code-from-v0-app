'use client';

import { useState } from 'react';
import { RegularLink } from '@/components/blocks';
import { Menu, AutoSelectText, PrimaryButton, SecondaryButton } from '@/components/blocks';

type Metric = 'accuracy' | 'latency' | 'context' | 'cost';

interface ModelComparison {
  name: string;
  accuracy: number;
  latency: number; // ms
  context: number; // tokens
  cost: number; // relative cost (1.0 = baseline)
}

const models: ModelComparison[] = [
  { name: 'SID Agentic', accuracy: 94, latency: 45, context: 128000, cost: 0.8 },
  { name: 'Traditional RAG', accuracy: 72, latency: 120, context: 32000, cost: 1.0 },
  { name: 'Vector Search', accuracy: 68, latency: 85, context: 16000, cost: 0.6 },
  { name: 'Hybrid Search', accuracy: 78, latency: 150, context: 64000, cost: 1.2 },
];

const metricLabels: Record<Metric, string> = {
  accuracy: 'Accuracy',
  latency: 'Latency',
  context: 'Context Window',
  cost: 'Cost',
};

const metricFormatters: Record<Metric, (value: number) => string> = {
  accuracy: (v) => `${v}%`,
  latency: (v) => `${v}ms`,
  context: (v) => `${(v / 1000).toFixed(0)}k`,
  cost: (v) => `${(v * 100).toFixed(0)}%`,
};

const faqs = [
  {
    question: "What makes SID's Agentic Retrieval Model different from traditional RAG?",
    answer: "Our model uses intelligent, context-aware reasoning to understand not just what you're asking, but why you need it and how different pieces of information connect. Traditional RAG systems rely on keyword matching and simple embeddings, while our agentic approach actively reasons about query intent and information relationships."
  },
  {
    question: "How is this different from using GPT-4 or Claude for retrieval?",
    answer: "Frontier models are general-purpose. We're specialized for retrieval through RL training on retrieval-specific tasks. This gives us 94% accuracy (vs ~87% for GPT-4 on retrieval) at 16x lower latency and 15x lower cost. You get better results, faster, for less."
  },
  {
    question: "Can I use this with my existing RAG setup?",
    answer: "Yes. SID integrates as a drop-in replacement for your retriever component. Keep your existing vector database, document processing, and orchestration—just swap the retrieval layer. Migration takes hours, not weeks."
  },
  { question: "Can I use SID's model even if I'm not using RAG?",
    answer: "Our initial model is designed to interact with your data through a REST API. This is only our first model. We're working on a series of models to handle different data structures and tasks."
  },
  {
    question: "What types of queries does it handle best?",
    answer: "The model excels at complex, multi-step queries that require understanding intent and connecting information across different sources. It's particularly effective for research, technical documentation, and knowledge-intensive applications where context matters."
  },
  {
    question: "What if my data structure is complex or domain-specific?",
    answer: "We're building a series of specialized models for different verticals and data types. Have specific requirements? Contact us at join@sid.ai to discuss custom training on your domain."
  },
  {
    question: "Can you train a model specifically for my use case?",
    answer: "Yes. For enterprise customers with unique retrieval needs, we offer custom RL training on your data and tasks. Reach out to discuss your requirements."
  },
  {
    question: "How do you ensure accuracy and prevent hallucinations?",
    answer: "Every retrieval includes source attribution with confidence scores. Our reasoning trace shows which sources were considered and why. You can verify every answer, audit decisions for compliance, and tune confidence thresholds based on your risk tolerance."
  }
];

const feaures = [
  {
    title: 'Agentic Reasoning',
    description: 'Actively reasons about query intent, not just keyword matching.'
  },
  {
    title: 'Beats GPT-5',
    description: 'Outperforms frontier models on retrieval at a fraction of time and cost.'
  },
  {
    title: 'Leading Accuracy',
    description: '94% accuracy on standardized and real-world benchmarks.'
  },
  {
    title: 'Enterprise Scale',
    description: 'Built to handle billions of documents with consistent performance.'
  }
]

export default function ModelClient() {
  const [selectedMetric, setSelectedMetric] = useState<Metric>('accuracy');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <>
      <h1>Retrieval That Reasons</h1>
      <p className="italic">
        Built for agents that can't afford to be wrong (or slow)
      </p>

      <p className="ParagraphWithoutH2">
        <b>TLDR: {" "}</b>
        <AutoSelectText>
        We trained a series of models for fast agentic models specialized in highly complex context retrieval. 
        They outperform the retrieval capabilities of frontier coding models, at a frraction of inference time and cost.
        </AutoSelectText>
      </p>


      <Menu items={[
           { element: <PrimaryButton text="Join Waitlist" onClick={() => window.location.href = 'mailto:join@sid.ai'} /> },
           { element: <SecondaryButton text="Read Technical Paper" onClick={() => window.location.href = '/research/sid-1-preview'} /> },
      ]} />
      
      <h2>Why This Matters:</h2>
      <p>
        <em>Everything the AI (agent) does is downstream of retrieval. {" "}</em>
         It doesn't matter how sophisticated your reasoning model is, how many tools it has access to, or how well-designed your prompt is. If retrieval fails—if the agent can't surface the right context—everything breaks. The reasoning happens on the wrong information. The action is based on incomplete context. The answer is confidently wrong.
      </p>
      <p> 
        <em>RAG can't keep up. {" "}</em>
        Traditional systems rely on keyword matching and vector similarity—techniques that can't keep pace with increasingly intelligent base models. Your AI gets smarter every quarter. Your retrieval doesn't. As models improve and agentic applications grow more complex, retrieval accuracy becomes the bottleneck.      </p>
      <p>
        <em>The cost of failure has changed.</em>
        Wrong answers in chat are annoying. Wrong actions taken by agents cost money: $50 in wasted LLM calls, the wrong person emailed , incorrect flights booked, transfers sent to the wrong account. Accuracy has never mattered more.
      </p>


      <h2>What Makes SID Different</h2>
      
      <p>
        <em>SID is a reasoning retrieval model. {" "}</em>
        RAG finds similar chunks to your query: One shot, no verification, no iteration. SID treats retrieval as a reasoning process: It breaks down complex questions, evaluates whether it found the right information, and goes back for more when needed. It can solve multi-hop retrieval problems through such iterative retrieval. It learns through reinforcement learning which retrieval strategies actually lead to correct answers.
      </p>

      <p>
        Here's what that means in practice: Ask traditional RAG "What was our enterprise pricing before we pivoted to SMB?" and it returns documents with the words "enterprise" and "pricing." 
        </p>
      <p>
        Ask SID and it reasons through the query—first retrieving your pivot timeline, then searching for pricing docs dated before that pivot, then cross-referencing with customer contracts from that period. It doesn't just match keywords. It thinks about what information is actually needed to answer the question, then goes and gets it.
        </p>


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', margin: '2rem 0' }}>
        {feaures.map((feature, index) => (
          <div key={index}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>{feature.title}</h3>
            <p className="footer-typo opacity-[var(--footer-opacity)]" style={{ margin: 0, lineHeight: '1.6' }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>

       <h2>Performance Benchmarks</h2>

      
      
      <p>
        Select a metric to see how we stack up against other approaches:
      </p>

      <div className="flex flex-row gap-4 justify-center">
        <button 
          className={`button-52 ${selectedMetric === 'accuracy' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('accuracy')}
        >
          Accuracy
        </button>
        <button 
          className={`button-52 ${selectedMetric === 'context' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('context')}
        >
          Context
        </button>
        <button 
          className={`button-52 ${selectedMetric === 'cost' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('cost')}
        >
          Cost
        </button>
        <button 
          className={`button-52 ${selectedMetric === 'latency' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('latency')}
        >
          Latency
        </button>
      </div>

      
      <img src="https://miro.medium.com/v2/resize:fit:4800/format:webp/0*RGbjPYg8axVQQ7Au" alt="Model Comparison" className="w-full" />

      <p className="text-[0.8125rem] leading-normal sm:text-[0.875rem] opacity-[var(--footer-opacity)]">
        All metrics are based on standardized benchmarks across common retrieval tasks. 
        Actual performance may vary based on use case and data characteristics.
      </p>


      <h2>How It Works</h2>
      <p>We're applying reinforcement learning to our model to improve its performance on specific tasks. Reasoning models such as OpenAI's o3 or DeepSeek's R1 have shown improvmenets via RL on speciic engineering or scientific tasks. </p>

      <Menu items={[
        { href: 'https://www.google.com', label: 'Read the technical paper' },
        { href: 'https://www.google.com', label: 'Read the docs' },
      ]} />

      
      <h2>Frequently Asked Questions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginTop: '1.5rem' }}>
        {faqs.map((faq, index) => {
          const isOpen = openFaqIndex === index;
          return (
            <div 
              key={index} 
              style={{ 
                borderBottom: index < faqs.length - 1 ? '1px solid var(--border-color-subtle)' : 'none',
                paddingBottom: isOpen ? '1.75rem' : '0',
                paddingTop: index === 0 ? '0' : '1.75rem',
                transition: 'padding 0.2s ease',
              }}
            >
              <button
                onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: 0,
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  fontWeight: 500,
                  lineHeight: 'inherit',
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {faq.question}
              </button>
              {isOpen && (
                <div 
                  style={{ 
                    marginTop: '1.25rem',
                    opacity: 0.8,
                    paddingLeft: '0',
                    animation: 'fadeIn 0.3s ease',
                    lineHeight: '1.625',
                  }}
                >
                  <p style={{ margin: 0 }}>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <h2>Ready to Build?</h2>
      
      <p style={{ marginBottom: '1.5rem', opacity: 0.8, lineHeight: '1.7' }}>
        Join companies already using SID's reasoning retrieval in production, or talk to our team about 
        your specific use case.
      </p>

      <Menu items={[
        { href: 'mailto:join@sid.ai', label: 'Join Waitlist', button: 'primary' },
        { href: 'mailto:join@sid.ai', label: 'Talk to Sales' },
      ]} />

      <p className="text-[0.8125rem] leading-normal sm:text-[0.875rem] opacity-[var(--footer-opacity)]" style={{ marginTop: '3rem' }}>
        Questions? Email us at join@sid.ai
      </p>
    </>
  );
}

