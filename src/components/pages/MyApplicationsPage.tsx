import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTypography } from '../../utils/typography';
import { useAuth } from '../auth/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import AnimatedButton from '../ui/AnimatedButton';
import UserZoneHeader from '../layout/UserZoneHeader';

interface ApplicationData {
  id: string;
  userId: string;
  applicationId: string;
  competitionCategory: 'youth' | 'future' | 'world';
  status: 'draft' | 'submitted';
  filmTitle: string;
  filmTitleTh?: string;
  genres: string[];
  format: string;
  duration: number;
  synopsis: string;
  files: {
    filmFile: {
      url: string;
      name: string;
      size: number;
    };
    posterFile: {
      url: string;
      name: string;
      size: number;
    };
    proofFile?: {
      url: string;
      name: string;
      size: number;
    };
  };
  submittedAt: any;
  createdAt: any;
  lastModified: any;
}

interface MyApplicationsPageProps {
  onSidebarToggle?: () => void;
}

const MyApplicationsPage: React.FC<MyApplicationsPageProps> = ({ onSidebarToggle }) => {
  const { i18n } = useTranslation();
  const { getClass } = useTypography();
  const { user } = useAuth();
  const currentLanguage = i18n.language as 'en' | 'th';

  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch user applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // First try simple query without orderBy to avoid index issues
        console.log('Fetching applications for user:', user.uid);
        
        const q = query(
          collection(db, 'submissions'),
          where('userId', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        console.log('Query returned', querySnapshot.size, 'documents');
        
        const userApplications: ApplicationData[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Processing document:', doc.id, data);
          
          // Construct application with safe defaults for files
          const application: ApplicationData = {
            id: doc.id,
            userId: data.userId || '',
            applicationId: data.applicationId || doc.id,
            competitionCategory: data.competitionCategory || data.category,
            status: data.status || 'draft',
            filmTitle: data.filmTitle || '',
            filmTitleTh: data.filmTitleTh,
            genres: data.genres || [],
            format: data.format || '',
            duration: data.duration || 0,
            synopsis: data.synopsis || '',
            files: {
              filmFile: {
                url: data.files?.filmFile?.downloadURL || '',
                name: data.files?.filmFile?.fileName || '',
                size: data.files?.filmFile?.fileSize || 0
              },
              posterFile: {
                url: data.files?.posterFile?.downloadURL || '',
                name: data.files?.posterFile?.fileName || '',
                size: data.files?.posterFile?.fileSize || 0
              },
              proofFile: data.files?.proofFile ? {
                url: data.files?.proofFile?.downloadURL || '',
                name: data.files?.proofFile?.fileName || '',
                size: data.files?.proofFile?.fileSize || 0
              } : undefined
            },
            submittedAt: data.submittedAt,
            createdAt: data.createdAt,
            lastModified: data.lastModified
          };
          
          // Validate that we have the essential data and at least a poster URL
          if (application.filmTitle && application.competitionCategory && application.files.posterFile.url) {
            console.log('Adding application:', application.id, application.filmTitle);
            console.log('Poster URL:', application.files.posterFile.url);
            userApplications.push(application);
          } else {
            console.warn('Skipping document with missing basic fields:', doc.id, {
              hasTitle: !!application.filmTitle,
              hasCategory: !!application.competitionCategory,
              hasPosterUrl: !!application.files.posterFile.url,
              posterData: data.files?.posterFile,
              data: data
            });
          }
        });

        // Sort by lastModified in memory (newest first)
        userApplications.sort((a, b) => {
          const aTime = a.lastModified?.toDate?.() || new Date(a.lastModified || 0);
          const bTime = b.lastModified?.toDate?.() || new Date(b.lastModified || 0);
          return bTime.getTime() - aTime.getTime();
        });

        console.log('Final applications array:', userApplications.length, 'applications');
        setApplications(userApplications);
      } catch (error) {
        console.error('Error fetching applications:', error);
        
        // Set empty array so UI shows "no applications" instead of loading forever
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const content = {
    th: {
      pageTitle: "ผลงานของฉัน",
      noApplications: "ยังไม่มีผลงานที่ส่งเข้าประกวด",
      noApplicationsDesc: "เริ่มส่งผลงานเข้าประกวดเพื่อดูรายการที่นี่",
      submitNow: "ส่งผลงานเลย",
      backToList: "กลับไปรายการ",
      loading: "กำลังโหลด...",
      draft: "ร่าง",
      submitted: "ส่งแล้ว",
      categories: {
        youth: "รางวัลหนังสั้นแฟนตาสติกเยาวชน",
        future: "รางวัลหนังสั้นแฟนตาสติกอนาคต",
        world: "รางวัลหนังสั้นแฟนตาสติกโลก"
      }
    },
    en: {
      pageTitle: "My Applications",
      noApplications: "No applications submitted yet",
      noApplicationsDesc: "Start submitting your films to see them listed here",
      submitNow: "Submit Now",
      backToList: "Back to List",
      loading: "Loading...",
      draft: "Draft",
      submitted: "Submitted",
      categories: {
        youth: "Youth Fantastic Short Film Award",
        future: "Future Fantastic Short Film Award",
        world: "World Fantastic Short Film Award"
      }
    }
  };

  const currentContent = content[currentLanguage];

  const getCategoryLogo = (category: string) => {
    const logos = {
      youth: "https://firebasestorage.googleapis.com/v0/b/cifan-c41c6.firebasestorage.app/o/site_files%2Ffest_logos%2FGroup%202.png?alt=media&token=e8be419f-f0b2-4f64-8d7f-c3e8532e2689",
      future: "https://firebasestorage.googleapis.com/v0/b/cifan-c41c6.firebasestorage.app/o/site_files%2Ffest_logos%2FGroup%203.png?alt=media&token=b66cd708-0dc3-4c05-bc56-b2f99a384287",
      world: "https://firebasestorage.googleapis.com/v0/b/cifan-c41c6.firebasestorage.app/o/site_files%2Ffest_logos%2FGroup%204.png?alt=media&token=84ad0256-2322-4999-8e9f-d2f30c7afa67"
    };
    return logos[category as keyof typeof logos];
  };

  const getStatusColor = (status: string) => {
    return status === 'submitted' ? 'text-green-400' : 'text-yellow-400';
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'submitted' 
      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(currentLanguage === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleApplicationClick = (applicationId: string) => {
    window.location.hash = `#application-detail/${applicationId}`;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* User Zone Header */}
      <UserZoneHeader
        title={currentContent.pageTitle}
        onSidebarToggle={onSidebarToggle || (() => {})}
      >
        {/* Add New Application Button */}
        <AnimatedButton
          variant="primary"
          size="medium"
          icon="➕"
          onClick={() => window.location.hash = '#competition'}
        >
          {currentLanguage === 'th' ? 'ส่งผลงานใหม่' : 'New Submission'}
        </AnimatedButton>
      </UserZoneHeader>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 sm:py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCB283] mb-4"></div>
          <p className={`${getClass('body')} text-white/80`}>
            {currentContent.loading}
          </p>
        </div>
      )}

      {/* No Applications State */}
      {!loading && applications.length === 0 && (
        <div className="glass-container rounded-2xl p-8 sm:p-12 text-center w-full">
          <div className="text-6xl mb-6">🎬</div>
          <h2 className={`text-2xl ${getClass('header')} mb-4 text-white`}>
            {currentContent.noApplications}
          </h2>
          <p className={`${getClass('body')} text-white/80 mb-8 max-w-md mx-auto`}>
            {currentContent.noApplicationsDesc}
          </p>
          <AnimatedButton
            variant="primary"
            size="large"
            icon="📋"
            onClick={() => window.location.hash = '#competition'}
          >
            {currentContent.submitNow}
          </AnimatedButton>
        </div>
      )}

      {/* Applications Grid */}
      {!loading && applications.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {applications.map((application) => (
            <div
              key={application.id}
              className="glass-container rounded-lg sm:rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-[#FCB283]/20 w-full"
              onClick={() => handleApplicationClick(application.id)}
            >
              {/* Poster Image */}
              <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-white/5">
                {application.files.posterFile?.url ? (
                  <img
                    src={application.files.posterFile.url}
                    alt={`${application.filmTitle} Poster`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-white/10">
                            <div class="text-center text-white/60">
                              <div class="text-4xl mb-2">🎬</div>
                              <div class="text-xs">No Poster</div>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/10">
                    <div className="text-center text-white/60">
                      <div className="text-4xl mb-2">🎬</div>
                      <div className="text-xs">
                        {currentLanguage === 'th' ? 'ไม่มีโปสเตอร์' : 'No Poster'}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Status Badge Overlay */}
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                  <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusBadgeColor(application.status)}`}>
                    {application.status === 'submitted' ? currentContent.submitted : currentContent.draft}
                  </span>
                </div>

                {/* Category Logo Overlay */}
                <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
                  <img
                    src={getCategoryLogo(application.competitionCategory)}
                    alt={`${application.competitionCategory} logo`}
                    className="h-4 sm:h-6 w-auto object-contain opacity-90"
                  />
                </div>
              </div>

              {/* Card Content */}
              <div className="p-2 sm:p-3">
                {/* Film Title */}
                <h3 className={`text-xs sm:text-sm ${getClass('header')} text-white mb-1 line-clamp-2 leading-tight`}>
                  {currentLanguage === 'th' && application.filmTitleTh 
                    ? application.filmTitleTh 
                    : application.filmTitle}
                </h3>

                {/* Category */}
                <p className={`${getClass('body')} text-[#FCB283] text-xs mb-1 sm:mb-2 line-clamp-1`}>
                  {currentContent.categories[application.competitionCategory as keyof typeof currentContent.categories]}
                </p>

                {/* Film Details */}
                <div className="space-y-0.5 sm:space-y-1 mb-1 sm:mb-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">
                      {currentLanguage === 'th' ? 'ประเภท:' : 'Format:'}
                    </span>
                    <span className="text-white capitalize text-right">
                      {application.format.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">
                      {currentLanguage === 'th' ? 'ความยาว:' : 'Duration:'}
                    </span>
                    <span className="text-white">
                      {application.duration} {currentLanguage === 'th' ? 'นาที' : 'min'}
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div className="pt-1 sm:pt-2 border-t border-white/10">
                  <p className="text-xs text-white/60 text-center leading-tight">
                    {application.status === 'submitted' 
                      ? (currentLanguage === 'th' ? 'ส่งเมื่อ: ' : 'Submitted: ') + formatDate(application.submittedAt)
                      : (currentLanguage === 'th' ? 'แก้ไขล่าสุด: ' : 'Last modified: ') + formatDate(application.lastModified)
                    }
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage;
