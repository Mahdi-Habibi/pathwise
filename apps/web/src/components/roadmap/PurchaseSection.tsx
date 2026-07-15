'use client';

import type { RoadmapResponse } from '@pathwise/shared';
import { useLanguage } from '@/context/LanguageProvider';
import { moduleMessageKey } from '@/i18n/domain';

interface PurchaseSectionProps {
  roadmap: RoadmapResponse;
  onBrowseCourses: () => void;
  onEnrollBundle: () => void;
}

export function PurchaseSection({
  roadmap,
  onBrowseCourses,
  onEnrollBundle,
}: PurchaseSectionProps) {
  const { modules, pricing } = roadmap;
  const { t, format } = useLanguage();

  return (
    <>
      <div className="purchase-head">
        <h3>{t('roadmap.purchase.head')}</h3>
        <p>{t('roadmap.purchase.sub')}</p>
      </div>
      <div className="purchase-grid">
        <div className="p-card outline">
          <h4>{t('roadmap.purchase.library.title')}</h4>
          <p className="p-desc">{t('roadmap.purchase.library.desc')}</p>
          {modules.map((m, i) => (
            <div key={m} className="course-mini">
              <span className="mname">{t(moduleMessageKey(m))}</span>
              <span className="mprice">{format.currency(pricing.individual[i])}</span>
            </div>
          ))}
          <button type="button" className="btn-outline-full" onClick={onBrowseCourses}>
            {t('roadmap.purchase.library.cta')}
          </button>
        </div>
        <div className="p-card highlight">
          <span className="badge-rec">{t('roadmap.purchase.bundle.badge')}</span>
          <h4>{t('roadmap.purchase.bundle.title')}</h4>
          <p className="p-desc">{t('roadmap.purchase.bundle.desc')}</p>
          <ul className="feature-list">
            <li>{t('roadmap.purchase.bundle.feature1')}</li>
            <li>{t('roadmap.purchase.bundle.feature2')}</li>
            <li>{t('roadmap.purchase.bundle.feature3')}</li>
            <li>{t('roadmap.purchase.bundle.feature4')}</li>
          </ul>
          <div className="price-row">
            <span className="price-strike">{format.currency(pricing.total)}</span>
            <span className="price-final">{format.currency(pricing.discounted)}</span>
          </div>
          <div className="price-sub">{t('roadmap.purchase.bundle.priceSub')}</div>
          <button type="button" className="btn-fill-full" onClick={onEnrollBundle}>
            {t('roadmap.purchase.bundle.cta')}
          </button>
        </div>
      </div>
    </>
  );
}
