import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/ui/Toast';
import { Building2, Save, CheckCircle2, ShieldCheck } from 'lucide-react';
import { InstitutionType } from '../../../types';

export const ApplicantProfilePage: React.FC = () => {
  const { currentInstitution, updateInstitutionProfile } = useApp();
  const { success } = useToast();

  const [name, setName] = useState(currentInstitution.name);
  const [institutionType, setInstitutionType] = useState<InstitutionType>(currentInstitution.institutionType);
  const [registrationNumber, setRegistrationNumber] = useState(currentInstitution.registrationNumber);
  const [aisheCode, setAisheCode] = useState(currentInstitution.aisheCode);
  const [state, setState] = useState(currentInstitution.state);
  const [district, setDistrict] = useState(currentInstitution.district);
  const [address, setAddress] = useState(currentInstitution.address);
  const [officialEmail, setOfficialEmail] = useState(currentInstitution.officialEmail);
  const [contactNumber, setContactNumber] = useState(currentInstitution.contactNumber);
  const [representativeName, setRepresentativeName] = useState(currentInstitution.representativeName);
  const [representativeDesignation, setRepresentativeDesignation] = useState(currentInstitution.representativeDesignation);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateInstitutionProfile({
      name,
      institutionType,
      registrationNumber,
      aisheCode,
      state,
      district,
      address,
      officialEmail,
      contactNumber,
      representativeName,
      representativeDesignation,
    });
    success('Profile Updated', 'Institution records have been saved to local persistence.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-deep">Institution Profile</h1>
        <p className="text-xs text-slate-muted">
          Manage regulatory registry credentials and designated authorized signatories.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-border p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center font-bold text-lg">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-deep">{name}</h2>
            <p className="text-xs text-slate-400">ID: {currentInstitution.id} • AISHE: {aisheCode}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-text mb-1">
              Official Institution Title
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-border focus:ring-1 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-text mb-1">
              Institution Classification
            </label>
            <select
              value={institutionType}
              onChange={(e) => setInstitutionType(e.target.value as InstitutionType)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-border bg-white"
            >
              <option value="Central University">Central University</option>
              <option value="State University">State University</option>
              <option value="Deemed University">Deemed University</option>
              <option value="Autonomous Engineering College">Autonomous Engineering College</option>
              <option value="Affiliated Technical Institute">Affiliated Technical Institute</option>
              <option value="Polytechnic Institute">Polytechnic Institute</option>
              <option value="Management Institute">Management Institute</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-text mb-1">
              Statutory Registration Code
            </label>
            <input
              type="text"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-border font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-text mb-1">
              AISHE Code
            </label>
            <input
              type="text"
              value={aisheCode}
              onChange={(e) => setAisheCode(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-border font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-text mb-1">
              State Jurisdiction
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-border"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-text mb-1">
              District
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-border"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-text mb-1">
              Official Registry Email
            </label>
            <input
              type="email"
              value={officialEmail}
              onChange={(e) => setOfficialEmail(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-border"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-text mb-1">
              Official Contact Phone
            </label>
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-border"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-text mb-1">
              Authorized Representative Name
            </label>
            <input
              type="text"
              value={representativeName}
              onChange={(e) => setRepresentativeName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-border"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-text mb-1">
              Designation
            </label>
            <input
              type="text"
              value={representativeDesignation}
              onChange={(e) => setRepresentativeDesignation(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-border"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-text mb-1">
              Full Physical Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-border"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Save size={15} />
            <span>Save Profile Updates</span>
          </button>
        </div>
      </form>
    </div>
  );
};
