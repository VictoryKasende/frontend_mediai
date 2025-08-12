import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Button from '../components/Button';

/**
 * Page de test pour naviguer vers les différentes interfaces
 */
const TestPage = () => {
  return (
    <div className="min-h-screen bg-light flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow-lg border border-light p-8 text-center">
          <div className="mb-8">
            <Logo size="lg" className="mx-auto mb-4" />
            <h1 className="text-medical-title text-3xl mb-2">Interface Patient Mediai</h1>
            <p className="text-medical-body">
              Testez l'interface de gestion des fiches de consultation patient
            </p>
          </div>

          <div className="space-y-4">
            <Link to="/demo/patient">
              <Button className="w-full h-16 text-lg">
                🏥 Tester le Dashboard Patient
              </Button>
            </Link>
            
            <Link to="/auth/login">
              <Button variant="outline" className="w-full h-12">
                🔐 Aller à la connexion
              </Button>
            </Link>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Fonctionnalités disponibles :</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✅ Formulaire de fiche de consultation (10 étapes)</li>
              <li>✅ Liste des consultations avec filtres</li>
              <li>✅ Détails des consultations et réponses médecin</li>
              <li>✅ Interface responsive et moderne</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
