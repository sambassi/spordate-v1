"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Heart,
  MapPin,
  Zap,
  Users,
  Trophy,
  CheckCircle,
  ArrowRight,
  Star,
  ChevronRight,
  Music,
  Flame,
  Sparkles,
  PartyPopper,
  Volume2
} from 'lucide-react';

interface DanceStyle {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

interface Testimonial {
  name: string;
  location: string;
  image: string;
  text: string;
  dance: string;
  rating: number;
}

// All available activities — admin controls which ones are "featured" via Firestore
// For now, defaults are hardcoded; in production, fetched from Firestore `settings/featuredActivities`
interface ActivityItem {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  type: 'dance' | 'sport';
}

const ALL_ACTIVITIES: ActivityItem[] = [
  // DANSE
  { id: 'afroboost',     name: 'Afroboost',      emoji: '🔥', color: 'from-orange-500 to-red-600',    description: 'Cardio afro, énergie max',    type: 'dance' },
  { id: 'zumba',         name: 'Zumba',           emoji: '💃', color: 'from-pink-500 to-rose-600',     description: 'Fitness fun & latine',        type: 'dance' },
  { id: 'afro_dance',    name: 'Afro Dance',      emoji: '🥁', color: 'from-amber-500 to-orange-600',  description: 'Rythmes africains',           type: 'dance' },
  { id: 'dance_fitness', name: 'Dance Fitness',   emoji: '⚡', color: 'from-violet-500 to-purple-600', description: 'Cardio dansé intense',        type: 'dance' },
  { id: 'salsa',         name: 'Salsa',           emoji: '🌶️', color: 'from-red-500 to-rose-600',      description: 'Passion & connexion',         type: 'dance' },
  { id: 'bachata',       name: 'Bachata',         emoji: '🎶', color: 'from-fuchsia-500 to-pink-600',  description: 'Douceur sensuelle',           type: 'dance' },
  { id: 'hiphop',        name: 'Hip-Hop',         emoji: '🎤', color: 'from-slate-600 to-zinc-800',    description: 'Grooves urbains',             type: 'dance' },
  { id: 'dance_workout', name: 'Dance Workout',   emoji: '💪', color: 'from-emerald-500 to-teal-600',  description: 'Full body en musique',        type: 'dance' },
  // SPORT
  { id: 'tennis',        name: 'Tennis',          emoji: '🎾', color: 'from-yellow-400 to-yellow-600', description: 'Match en duo ou en groupe',    type: 'sport' },
  { id: 'yoga',          name: 'Yoga',            emoji: '🧘', color: 'from-green-400 to-green-600',   description: 'Zen & souplesse',             type: 'sport' },
  { id: 'running',       name: 'Running',         emoji: '🏃', color: 'from-red-400 to-red-600',       description: 'Cours ensemble, va plus loin',type: 'sport' },
  { id: 'fitness',       name: 'Fitness',         emoji: '🏋️', color: 'from-blue-500 to-blue-700',     description: 'Sculpte-toi entre potes',     type: 'sport' },
  { id: 'swimming',      name: 'Natation',        emoji: '🏊', color: 'from-cyan-400 to-cyan-600',     description: 'Piscine & eau libre',         type: 'sport' },
  { id: 'climbing',      name: 'Escalade',        emoji: '🧗', color: 'from-purple-400 to-purple-600', description: 'Grimpe & dépassement',        type: 'sport' },
  { id: 'cycling',       name: 'Vélo',            emoji: '🚴', color: 'from-lime-500 to-green-600',    description: 'Ride en duo ou en groupe',    type: 'sport' },
  { id: 'crossfit',      name: 'CrossFit',        emoji: '🔨', color: 'from-zinc-500 to-zinc-700',     description: 'Haute intensité, résultats',  type: 'sport' },
];

// Default featured activities (admin overrides via Firestore settings/featuredActivities)
const DEFAULT_FEATURED_IDS = ['afroboost', 'zumba', 'salsa', 'hiphop', 'dance_fitness', 'tennis', 'yoga', 'fitness'];

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Amina K.',
    location: 'Genève',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    text: 'Grâce à Spordateur, j\'ai trouvé ma partenaire d\'Afroboost ! On se motive chaque semaine et c\'est devenu notre rituel.',
    dance: 'Afroboost',
    rating: 5
  },
  {
    name: 'Karim D.',
    location: 'Zürich',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    text: 'Fan de salsa depuis 3 ans, j\'ai enfin trouvé une partenaire à mon niveau. L\'appli rend le premier pas tellement plus facile !',
    dance: 'Salsa',
    rating: 5
  },
  {
    name: 'Léa M.',
    location: 'Lausanne',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    text: 'J\'ai découvert le Dance Fitness via l\'app et maintenant c\'est ma passion ! Ambiance incroyable, zéro pression.',
    dance: 'Dance Fitness',
    rating: 5
  },
  {
    name: 'David N.',
    location: 'Bern',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    text: 'Bachata en duo, c\'est 100x mieux ! Spordateur a cassé la pression du premier rendez-vous. On danse, on rigole, c\'est tout.',
    dance: 'Bachata',
    rating: 5
  }
];

const SWISS_CITIES = ['Genève', 'Zürich', 'Lausanne', 'Bern', 'Bâle', 'Lucerne', 'Neuchâtel', 'Fribourg'];

// Animated music notes for background
function FloatingNotes() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {['🎵', '🎶', '💃', '🔥', '🥁', '⚡'].map((emoji, i) => (
        <div
          key={i}
          className="absolute animate-bounce opacity-10 text-4xl"
          style={{
            left: `${15 + i * 15}%`,
            top: `${10 + (i % 3) * 30}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${3 + i * 0.5}s`,
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
}

// Pulsing beat bar (visual rhythm element)
function BeatBar() {
  return (
    <div className="flex items-end gap-1 h-8">
      {[0.6, 1, 0.4, 0.8, 0.5, 1, 0.3, 0.9, 0.6, 0.7].map((h, i) => (
        <div
          key={i}
          className="w-1 bg-gradient-to-t from-orange-500 to-rose-500 rounded-full animate-pulse"
          style={{
            height: `${h * 100}%`,
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.8s',
          }}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);
  // In production, fetch from Firestore `settings/featuredActivities` doc
  // For now, use defaults — admin dashboard will write to this doc
  const [featuredIds] = useState<string[]>(DEFAULT_FEATURED_IDS);
  const featuredActivities = ALL_ACTIVITIES.filter(a => featuredIds.includes(a.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Animated background with music vibes */}
      <FloatingNotes />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b border-slate-700/50 backdrop-blur-xl bg-slate-900/80">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-rose-500 rounded-lg flex items-center justify-center">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">Spordateur</span>
              <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded-full border border-orange-500/30">Dance Edition</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition">Comment ça marche</a>
              <a href="#dance-styles" className="text-gray-300 hover:text-white transition">Danses</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition">Avis</a>
              <Button asChild className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold hover:shadow-lg hover:shadow-orange-500/50">
                <Link href="/signup">Commencer</Link>
              </Button>
            </div>
            <div className="md:hidden">
              <Button asChild size="sm" className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold">
                <Link href="/signup">Commencer</Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section — Dance Energy */}
        <section className="container mx-auto px-4 py-20 md:py-32 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-center gap-3 flex-wrap">
              <span className="px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-medium animate-pulse">
                🔥 Afroboost • Zumba • Salsa • Hip-Hop
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white">
              Bouge. Matche.
              <span className="block mt-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400">
                Kiffe.
              </span>
            </h1>

            <div className="flex justify-center">
              <BeatBar />
            </div>

            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Sport ou danse, trouve ton partenaire près de chez toi. Zéro pression, 100% fun. On bouge d'abord, on voit après.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-lg px-8 py-6 rounded-full shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-rose-500/50 transition-all transform hover:scale-105">
                <Link href="/signup">
                  <Sparkles className="mr-2 h-5 w-5" /> Rejoins le mouvement
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-orange-500/50 text-gray-200 hover:bg-orange-500/10 px-8 py-6 rounded-full">
                <Link href="#how-it-works">
                  Comment ça marche <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="pt-8 flex flex-col md:flex-row gap-8 justify-center items-center text-sm text-gray-400 border-t border-slate-700/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>100% gratuit pour commencer</span>
              </div>
              <div className="flex items-center gap-2">
                <Music className="h-5 w-5 text-orange-400" />
                <span>8 styles de danse</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-400" />
                <span>Ambiance sans pression</span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works — Dance Edition */}
        <section id="how-it-works" className="container mx-auto px-4 py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">3 étapes pour danser</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Pas besoin d'être pro. Juste l'envie de bouger et de rencontrer du monde.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: 1, icon: '💃', title: 'Choisis ton style', desc: 'Afroboost, Salsa, Zumba, Hip-Hop... Dis-nous ce qui te fait vibrer et ton niveau.' },
              { step: 2, icon: '🔥', title: 'Matche & discute', desc: 'On te propose des danseurs près de toi. Matche, papote, et organisez votre session.' },
              { step: 3, icon: '🎉', title: 'Danse & kiffe', desc: 'Retrouvez-vous dans un studio partenaire. Dansez, rigolez, et faites-vous des potes !' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative">
                <div className="absolute top-0 left-0 h-12 w-12 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {step}
                </div>
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur h-full pt-20 hover:border-orange-500/30 transition-all group">
                  <CardContent className="space-y-4">
                    <div className="flex justify-center mb-4 text-5xl group-hover:scale-125 transition-transform">
                      {icon}
                    </div>
                    <h3 className="text-xl font-bold text-center text-white">{title}</h3>
                    <p className="text-gray-400 text-center">{desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Activities Grid — Mix Sport + Danse (admin-controlled) */}
        <section id="dance-styles" className="container mx-auto px-4 py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Quel est ton <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">move</span> ?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Sport ou danse, trouve l'activité qui te fait vibrer
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8">
            {featuredActivities.map((activity) => (
              <Card
                key={activity.id}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur hover:border-orange-500/30 transition-all cursor-pointer group"
                onMouseEnter={() => setHoveredActivity(activity.id)}
                onMouseLeave={() => setHoveredActivity(null)}
              >
                <CardContent className="p-6 text-center space-y-3">
                  <div className={`h-14 w-14 mx-auto bg-gradient-to-r ${activity.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg`}>
                    {activity.emoji}
                  </div>
                  <h3 className="font-semibold text-white">{activity.name}</h3>
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${activity.type === 'dance' ? 'bg-orange-500/20 text-orange-300' : 'bg-blue-500/20 text-blue-300'}`}>
                    {activity.type === 'dance' ? 'Danse' : 'Sport'}
                  </span>
                  <p className={`text-xs text-gray-500 transition-all ${hoveredActivity === activity.id ? 'opacity-100 max-h-10' : 'opacity-0 max-h-0'} overflow-hidden`}>
                    {activity.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dance level selector teaser */}
          <div className="max-w-2xl mx-auto mt-12">
            <Card className="bg-gradient-to-r from-orange-500/10 to-rose-500/10 border-orange-500/20 backdrop-blur">
              <CardContent className="p-6 flex flex-col md:flex-row items-center gap-4">
                <div className="text-4xl">🎯</div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="font-bold text-white mb-1">Matching par niveau</h4>
                  <p className="text-gray-400 text-sm">
                    Débutant, intermédiaire ou avancé ? On te matche avec des danseurs de ton niveau pour que tu sois à l'aise dès le premier pas.
                  </p>
                </div>
                <div className="flex gap-2">
                  {['🌱', '⭐', '🏆'].map((emoji, i) => (
                    <div key={i} className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center text-lg border border-slate-700 hover:border-orange-500 transition-colors cursor-pointer">
                      {emoji}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="container mx-auto px-4 py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ils dansent déjà ensemble</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Des rencontres qui bougent, zéro pression, 100% bonne énergie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((testimonial, idx) => (
              <Card key={idx} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur hover:border-orange-500/30 transition">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-1">
                    {Array(testimonial.rating)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                  </div>
                  <p className="text-gray-300 italic text-lg">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 overflow-hidden flex-shrink-0">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{testimonial.name}</p>
                      <p className="text-gray-400 text-xs flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {testimonial.location} • {testimonial.dance}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Swiss Coverage */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white">On danse dans toute la Suisse</h2>
                <p className="text-gray-300 text-lg">
                  Studios partenaires, salles de danse et espaces fitness. Trouve un spot près de chez toi pour ta prochaine session.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {SWISS_CITIES.map((city) => (
                    <div key={city} className="flex items-center gap-2 text-gray-300">
                      <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
                      {city}
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative h-64 md:h-auto flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-rose-500/20 rounded-lg" />
                <div className="text-8xl animate-bounce" style={{ animationDuration: '2s' }}>💃</div>
              </div>
            </div>
          </Card>
        </section>

        {/* Studio Partner CTA */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <Card className="bg-gradient-to-r from-orange-600/20 to-rose-600/20 border-orange-500/30 backdrop-blur overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Tu es un studio de danse ou une salle fitness ?
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Rejoins le réseau Spordateur. Remplis tes cours, gagne en visibilité et connecte-toi avec des danseurs motivés.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-lg px-8 py-6 hover:shadow-lg">
                  <Link href="/partners">Devenir partenaire</Link>
                </Button>
                <Button variant="outline" className="border-orange-500/50 text-gray-200 hover:bg-orange-500/10 text-lg px-8 py-6">
                  Nous contacter
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Prêt à bouger ? <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">Let's Dance.</span>
            </h2>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              Rejoins la communauté de danseurs qui se rencontrent chaque semaine
            </p>
            <div className="flex justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-lg px-10 py-7 rounded-full shadow-xl shadow-orange-500/50 hover:shadow-2xl hover:shadow-rose-500/50 transition-all transform hover:scale-105">
                <Link href="/signup">
                  <Flame className="mr-2 h-5 w-5" /> Créer mon profil danseur
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-700/50 backdrop-blur bg-slate-900/50 mt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-rose-500 rounded-lg flex items-center justify-center">
                    <Flame className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-lg text-white">Spordateur</span>
                </div>
                <p className="text-gray-400 text-sm">
                  La plateforme suisse de rencontres par la danse. Bouge, matche, kiffe.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Danses</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition">Afroboost</a></li>
                  <li><a href="#" className="hover:text-white transition">Zumba</a></li>
                  <li><a href="#" className="hover:text-white transition">Salsa & Bachata</a></li>
                  <li><a href="#" className="hover:text-white transition">Hip-Hop</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Entreprise</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition">À propos</a></li>
                  <li><a href="#" className="hover:text-white transition">Studios partenaires</a></li>
                  <li><a href="#" className="hover:text-white transition">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition">Presse</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Légal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition">Confidentialité</a></li>
                  <li><a href="#" className="hover:text-white transition">Conditions</a></li>
                  <li><a href="#" className="hover:text-white transition">Cookies</a></li>
                  <li><a href="#" className="hover:text-white transition">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-700/50 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
              <p>&copy; 2026 Spordateur. Dance Edition. Tous droits réservés.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-white transition">Instagram</a>
                <a href="#" className="hover:text-white transition">TikTok</a>
                <a href="#" className="hover:text-white transition">YouTube</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
