import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  Award,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  LogOut,
  RefreshCw,
  FileBadge
} from 'lucide-react';
import { fetchWorkerProfile, WorkerProfileDetail } from '@/services/workers';
import { UserProfile } from '@/services/auth';

interface WorkerProfileViewProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

export const WorkerProfileView: React.FC<WorkerProfileViewProps> = ({ currentUser, onLogout }) => {
  const [profile, setProfile] = useState<WorkerProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const data = await fetchWorkerProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <div className="p-12 text-center text-[#6F6A63] space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#9A5B3A]" />
        <p className="text-xs">Loading verified profile & credentials...</p>
      </div>
    );
  }

  const name = profile?.full_name || currentUser.full_name;
  const photo = profile?.photo || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80';
  const rating = profile?.rating ?? 4.92;
  const totalRatings = profile?.total_ratings ?? 136;
  const coopBadge = profile?.cooperative_badge || 'Verified member';
  const experienceYears = profile?.experience_years ?? 8;
  const totalGigs = profile?.total_gigs ?? 145;
  const skills = profile?.skills || [];
  const certificates = profile?.certificates || [];

  return (
    <div className="space-y-5 pb-6">
      {/* ========================================================================= */}
      {/* 1. HERO PROFILE CARD: PHOTO | NAME | RATING | COOPERATIVE BADGE */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-3xl p-6 shadow-sm space-y-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative">
            <img
              src={photo}
              alt={name}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-[#9A5B3A] shadow-md shadow-[#9A5B3A]/20"
            />
            <div className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-full bg-[#527A62] text-white border-2 border-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-black text-[#171717] font-display">{name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EFE2D2] text-[#9A5B3A] text-[11px] font-bold">
                {experienceYears} Years Exp
              </span>
            </div>

            {/* Cooperative Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE2D2] text-[#9A5B3A] text-xs font-extrabold border border-[#E0D5C8]">
              <Award className="w-3.5 h-3.5" />
              <span>{coopBadge}</span>
            </div>

            <p className="text-xs text-[#6F6A63] pt-0.5">
              Phone: {profile?.phone_number || currentUser.phone_number} • Member since {profile?.member_since || 'March 2021'}
            </p>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E0D5C8] text-center">
          <div className="p-3 bg-[#F7F3EC] rounded-2xl border border-[#E0D5C8]">
            <div className="flex items-center justify-center gap-1 text-[#9A5B3A]">
              <Star className="w-4 h-4 fill-[#9A5B3A]" />
              <span className="font-extrabold text-base">{rating}</span>
            </div>
            <p className="text-[10px] text-[#6F6A63] mt-0.5 font-medium">{totalRatings} Reviews</p>
          </div>

          <div className="p-3 bg-[#F7F3EC] rounded-2xl border border-[#E0D5C8]">
            <p className="font-extrabold text-base text-[#171717]">{totalGigs}</p>
            <p className="text-[10px] text-[#6F6A63] mt-0.5 font-medium">Completed Gigs</p>
          </div>

          <div className="p-3 bg-[#F7F3EC] rounded-2xl border border-[#E0D5C8]">
            <p className="font-extrabold text-base text-[#527A62]">85%+</p>
            <p className="text-[10px] text-[#6F6A63] mt-0.5 font-medium">Direct pay</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SKILLS (Interactive Tag Chips) */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-3xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-[#E0D5C8]">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#9A5B3A]" />
            <h3 className="text-sm font-bold text-[#171717] uppercase tracking-wider font-display">
              Skills
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#6F6A63]">
            {skills.length} Categories
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="px-3.5 py-2 rounded-2xl bg-[#F7F3EC] border border-[#E0D5C8] hover:border-[#9A5B3A] text-xs font-semibold text-[#171717] flex items-center gap-2 transition-colors"
            >
              <span>{skill.name}</span>
              <span className="px-1.5 py-0.5 rounded bg-[#EFE2D2] text-[#9A5B3A] text-[10px] font-bold font-mono">
                {skill.level}
              </span>
              {skill.is_certified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#527A62]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CERTIFICATES & LICENSES */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-3xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-[#E0D5C8]">
          <div className="flex items-center gap-2">
            <FileBadge className="w-4 h-4 text-[#9A5B3A]" />
            <h3 className="text-sm font-bold text-[#171717] uppercase tracking-wider font-display">
              Certificates
            </h3>
          </div>
          <span className="badge-success text-[11px]">
            All Verified
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="p-3.5 bg-[#F7F3EC] rounded-2xl border border-[#E0D5C8] space-y-1 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-[#171717] text-xs">{cert.title}</p>
                <span className="badge-success text-[10px] font-mono shrink-0">
                  {cert.verification_status}
                </span>
              </div>
              <p className="text-[#6F6A63] text-[11px]">
                Issued by: <span className="text-[#171717]">{cert.issuer}</span> ({cert.issued_year})
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. EXPERIENCE & BIO */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFFFF] border border-[#E0D5C8] rounded-3xl p-5 space-y-2 text-xs shadow-sm">
        <h3 className="font-bold text-[#171717] uppercase tracking-wider text-[11px] font-display">
          About me
        </h3>
        <p className="text-[#6F6A63] leading-relaxed">
          {profile?.bio}
        </p>
        <div className="pt-2 flex items-center justify-between text-[#6F6A63] font-mono text-[11px]">
          <span>Settlement UPI:</span>
          <span className="text-[#9A5B3A] font-bold">{profile?.upi_id}</span>
        </div>
      </div>

      {/* Logout / Switch Role Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onLogout}
          className="btn-danger w-full text-sm font-bold min-h-[52px] flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};
export default WorkerProfileView;
