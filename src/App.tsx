import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CategoryType,
  EMPTY_FILTERS,
  FilterState,
  LocationType,
  Mood,
  MyLocation,
  Pose,
  ScenarioCategory,
  ViewTab,
} from './types/pose';
import { sortForProgression } from './data/poses';
import { scopeOf } from './data/taxonomy';
import {
  Prefs,
  deletePoseEverywhere,
  promotePose,
  filterPoses,
  getAllPoses,
  getFavoriteIds,
  getNextPose,
  getPrefs,
  getRecentIds,
  hasOnboarded,
  markOnboarded,
  pushRecent,
  savePrefs,
  toggleFavorite,
  getMyLocations,
  saveMyLocation,
  deleteMyLocation,
  getSelectedLocationId,
  setSelectedLocationId,
  getStudioProfile,
  saveStudioProfile,
  getOfficeProjects,
  saveOfficeProject,
  deleteOfficeProject,
  getOfficeProject,
} from './services/storage';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SideMenu } from './components/SideMenu';
import { Splash } from './components/Splash';
import { Onboarding } from './components/Onboarding';
import { AddPoseSheet } from './components/AddPoseSheet';
import { ToastData, ToastStack } from './components/Toast';
import { ConfirmDialog, ConfirmRequest } from './components/ConfirmDialog';
import { AddToProjectSheet } from './components/AddToProjectSheet';
import { LogOut, Trash2 } from 'lucide-react';

import { HomeView } from './views/HomeView';
import { LibraryView } from './views/LibraryView';
import { FavoritesView } from './views/FavoritesView';
import { MyPosesView } from './views/MyPosesView';
import { LocationsView } from './views/LocationsView';
import { PoseDetailView } from './views/PoseDetailView';
import { SettingsView } from './views/SettingsView';
import { PrinciplesView } from './views/PrinciplesView';
import { PoseTipsView } from './views/PoseTipsView';
import { MyLocationsView } from './views/MyLocationsView';
import { OfficeView } from './views/OfficeView';
import { ProjectDetailView } from './views/ProjectDetailView';
import { StudioProfileDialog } from './components/StudioProfileDialog';
import { WeatherView } from './views/WeatherView';
import { MyLocationDialog } from './components/MyLocationDialog';
import { GearChecklist } from './components/GearChecklist';
import { AfficheView } from './views/AfficheView';
import { ColleaguesView } from './views/ColleaguesView';
import { requestAfficheNotifications } from './services/afficheNotifications';
import { ShootMode } from './components/ShootMode';
import { QuickStartSheet } from './components/QuickStartSheet';
import { restorePremium } from './services/bazaarBilling';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [leavingSplash, setLeavingSplash] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  const [prefs, setPrefs] = useState<Prefs>(getPrefs());
  const [tab, setTab] = useState<ViewTab>('home');
  const [poses, setPoses] = useState<Pose[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<Pose | null>(null);
  const [filters, setFilters] = useState<FilterState>({ ...EMPTY_FILTERS });

  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPose, setEditingPose] = useState<Pose | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);
  const [addToProjectPose, setAddToProjectPose] = useState<Pose | null>(null);
  const [myLocations, setMyLocations] = useState<MyLocation[]>([]);
  const [selectedLocationId, setSelLocId] = useState<string | null>(null);
  const [locDialogOpen, setLocDialogOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<MyLocation | null>(null);
  const [studioProfile, setStudioProfile] = useState<any>(null);
  const [officeProjects, setOfficeProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [draftOfficeProject, setDraftOfficeProject] = useState<any | null>(null);
  const [projectEditorMode, setProjectEditorMode] = useState<'view' | 'edit' | 'create' | 'created'>('view');
  const [studioDialogOpen, setStudioDialogOpen] = useState(false);
  const [newShotlistRequest, setNewShotlistRequest] = useState(0);
  const histRef = useRef<ViewTab[]>([]);
  const goBackRef = useRef<() => void>(() => {});

  // شروع سریع: انتخاب لوکیشن/مرحله باغ عمارت → صف آماده → حالت عکاسی
  const [quickStartOpen, setQuickStartOpen] = useState(false);
  const [shootOpen, setShootOpen] = useState(false);
  const [shootQueue, setShootQueue] = useState<Pose[]>([]);
  const [shootIndex, setShootIndex] = useState(0);

  const toast = useCallback((text: string, ok = true) => {
    const id = Date.now() + Math.random();
    setToasts((cur) => [...cur, { id, text, kind: ok ? 'ok' : 'warn' }]);
    setTimeout(() => setToasts((cur) => cur.filter((t) => t.id !== id)), 3200);
  }, []);

  const reload = useCallback(() => {
    const all = getAllPoses();
    setPoses(all);
    setFavoriteIds(getFavoriteIds());
    setRecentIds(getRecentIds());
    setPrefs(getPrefs());
    setMyLocations(getMyLocations());
    setStudioProfile(getStudioProfile());
    setOfficeProjects(getOfficeProjects());
    setSelLocId(getSelectedLocationId());
    setSelected((cur) => (cur ? all.find((p) => p.id === cur.id) || null : null));
  }, []);

  useEffect(() => {
    const refreshEntitlements = () => reload();
    window.addEventListener('atelito:premium-changed', refreshEntitlements);
    return () => window.removeEventListener('atelito:premium-changed', refreshEntitlements);
  }, [reload]);

  // ناوبری برگشت: هر تغییر صفحه یک ورودی تاریخچه مرورگر می‌سازد تا دکمه برگشت
  // (چه در وب، چه دکمه سخت‌افزاری اندروید) همیشه دقیقاً یک قدم به عقب برود.
  const askExit = useCallback(() => {
    setConfirmRequest({
      title: 'خروج از برنامه',
      text: 'آیا می‌خواهید از Atelito خارج شوید؟',
      confirmLabel: 'خروج',
      cancelLabel: 'ماندن',
      tone: 'gold',
      icon: LogOut,
      onConfirm: () => {
        const cap = (window as any).Capacitor;
        if (cap?.isNativePlatform?.()) {
          import('@capacitor/app')
            .then((mod) => mod.App.exitApp())
            .catch(() => window.close());
        } else {
          window.close();
        }
      },
    });
  }, []);

  /**
   * مدیریت دکمه‌ی برگشت (دکمه‌ی سخت‌افزاری اندروید و دکمه‌ی برگشت مرورگر):
   *  • اگر پنجره‌ای باز است → همان را ببند.
   *  • یک بار زدن → یک مرحله به عقب (صفحه‌ی قبلی).
   *  • زدن‌های بعدی تا رسیدن به خانه ادامه می‌دهد.
   *  • در خانه با زدن برگشت → پرسیدن خروج از برنامه.
   */
  const goBack = useCallback(() => {
    // ۱) اول اگر پنجره/اورلی باز است بسته شود
    if (shootOpen) { setShootOpen(false); return; }
    if (quickStartOpen) { setQuickStartOpen(false); return; }
    if (sheetOpen) { setSheetOpen(false); return; }
    if (menuOpen) { setMenuOpen(false); return; }
    if (confirmRequest) { setConfirmRequest(null); return; }
    if (addToProjectPose) { setAddToProjectPose(null); return; }
    if (locDialogOpen) { setLocDialogOpen(false); return; }
    if (studioDialogOpen) { setStudioDialogOpen(false); return; }

    // ۲) یک مرحله به عقب برو
    if (histRef.current.length > 0) {
      const prev = histRef.current[histRef.current.length - 1];
      histRef.current = histRef.current.slice(0, -1);
      setTab(prev);
      scrollTop();
      return;
    }

    // ۳) در خانه هستیم: خروج از برنامه را بپرس
    askExit();
  }, [shootOpen, quickStartOpen, sheetOpen, menuOpen, confirmRequest, addToProjectPose, locDialogOpen, studioDialogOpen, askExit]);

  useEffect(() => { goBackRef.current = goBack; }, [goBack]);

  useEffect(() => {
    // یک ورودی «تله» در تاریخچه نگه می‌داریم تا دکمه‌ی برگشت مرورگر/سیستم همیشه به goBack برسد
    window.history.pushState({ trap: true }, '');
    const onPopState = () => {
      goBackRef.current();
      window.history.pushState({ trap: true }, '');
    };
    window.addEventListener('popstate', onPopState);

    let removeCap: (() => void) | undefined;
    const cap = (window as any).Capacitor;
    if (cap?.isNativePlatform?.()) {
      import('@capacitor/app')
        .then((mod) => {
          const sub = mod.App.addListener('backButton', () => goBackRef.current());
          removeCap = () => { sub.then((sm) => sm.remove()).catch(() => {}); };
        })
        .catch(() => {});
    }
    return () => {
      window.removeEventListener('popstate', onPopState);
      removeCap?.();
    };
  }, []);

  useEffect(() => {
    reload();
    void restorePremium().then(() => reload());
    void requestAfficheNotifications();
    setShowIntro(!hasOnboarded());
    const t1 = setTimeout(() => setLeavingSplash(true), 700);
    const t2 = setTimeout(() => setBooting(false), 1050);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reload]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const goTab = (t: ViewTab) => {
    if (t === tab) { scrollTop(); return; }
    // خانه ریشه است: پشته‌ی ناوبری را خالی می‌کند
    histRef.current = t === 'home' ? [] : [...histRef.current, tab];
    setTab(t);
    scrollTop();
  };

  const openPose = (pose: Pose) => {
    setSelected(pose);
    setRecentIds(pushRecent(pose.id));
    if (tab !== 'detail') {
      histRef.current = [...histRef.current, tab];
      setTab('detail');
    }
    scrollTop();
  };

  const handleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setFavoriteIds(toggleFavorite(id));
  };

  const nextPose = (sameCategory = false) => {
    const base: FilterState = sameCategory && selected ? { ...EMPTY_FILTERS, category: selected.category } : filters;
    const next = getNextPose(selected?.id, base);
    setSelected(next);
    setRecentIds(getRecentIds());
    setTab('detail');
    scrollTop();
  };


  const openAddPose = () => {
    setEditingPose(null);
    setSheetOpen(true);
  };

  const editPose = (p: Pose) => {
    setEditingPose(p);
    setSheetOpen(true);
  };

  const removePose = (p: Pose) => {
    setConfirmRequest({
      title: 'حذف ژست',
      text: `ژست «${p.title}» حذف شود؟ این ژست دیگر در برنامه نمایش داده نمی‌شود.`,
      confirmLabel: 'حذف ژست',
      tone: 'danger',
      icon: Trash2,
      onConfirm: () => {
        deletePoseEverywhere(p);
        if (selected?.id === p.id) setSelected(null);
        reload();
        toast('ژست حذف شد.');
      },
    });
  };

  const promote = (p: Pose) => {
    setConfirmRequest({
      title: 'انتقال به ژست‌های اصلی',
      text: `ژست «${p.title}» به ژست‌های اصلی منتقل شود؟`,
      confirmLabel: 'انتقال',
      tone: 'neutral',
      onConfirm: () => {
        if (promotePose(p.id)) {
          reload();
          toast('ژست به ژست‌های اصلی منتقل شد.');
        } else toast('انتقال ژست انجام نشد.', false);
      },
    });
  };

  const addToProject = (p: Pose) => setAddToProjectPose(p);

  const updatePrefs = (p: Prefs) => {
    savePrefs(p);
    setPrefs(p);
  };

  const pickCategory = (c: CategoryType) => {
    setFilters({ ...EMPTY_FILTERS, category: c });
    goTab('library');
  };

  /**
   * لوکیشن = Context. فیلتر «قابل اجرا در این لوکیشن» می‌شود، نه «مالِ این لوکیشن»؛
   * بنابراین ژست‌های عمومی سازگار هم دیده می‌شوند.
   */
  const pickLocation = (l: LocationType) => {
    setFilters({ ...EMPTY_FILTERS, location: l });
    goTab('library');
  };

  /** فقط ژست‌هایی که واقعاً به ویژگی فیزیکی همان محیط وابسته‌اند */
  const pickLocationSpecial = (l: LocationType) => {
    setFilters({ ...EMPTY_FILTERS, location: l, scope: 'اختصاصی لوکیشن' });
    goTab('library');
  };

  /** محور اصلی ناوبری: مرحله سناریوی تصویربرداری */
  const pickScenario = (sc: ScenarioCategory) => {
    setFilters({ ...EMPTY_FILTERS, scenario: sc });
    goTab('library');
  };

  /** ورود از سمت نیاز کاربر: «یک ژست رمانتیک دونفره می‌خواهم» */
  const pickMood = (m: Mood) => {
    setFilters({ ...EMPTY_FILTERS, mood: m });
    goTab('library');
  };

  /**
   * شروع سریع: اول مرحله سناریو، بعد (اختیاری) لوکیشن.
   *  • بدون لوکیشن → فقط ژست‌های عمومی همان مرحله.
   *  • با لوکیشن   → ژست‌های عمومی سازگار + ژست‌های اختصاصی همان محیط،
   *                  به‌طوری‌که اختصاصی‌ها انتهای صف بیایند (امضای همان لوکیشن).
   */
  const startQuickShoot = (scenario: ScenarioCategory | 'همه', location: LocationType | null) => {
    const base: FilterState = {
      ...EMPTY_FILTERS,
      scenario,
      location: location || 'همه',
      scope: location ? 'همه' : 'عمومی',
    };
    let queue = sortForProgression(filterPoses(poses, base, favoriteIds));
    if (location) {
      const general = queue.filter((p) => scopeOf(p) === 'عمومی');
      const special = queue.filter((p) => scopeOf(p) !== 'عمومی');
      queue = [...general, ...special];
    }
    if (queue.length === 0) {
      queue = sortForProgression(filterPoses(poses, { ...EMPTY_FILTERS, scenario }, favoriteIds));
    }
    if (queue.length === 0) { toast('ژستی برای این بخش پیدا نشد.', false); return; }
    setShootQueue(queue);
    setShootIndex(0);
    setSelected(queue[0]);
    setRecentIds(pushRecent(queue[0].id));
    setQuickStartOpen(false);
    setShootOpen(true);
  };

  const quickShootNext = () => {
    if (shootQueue.length === 0) return;
    const next = shootIndex + 1;
    if (next >= shootQueue.length) {
      toast('صف این بخش تمام شد. کارت عالی بود!');
      setShootOpen(false);
      return;
    }
    setShootIndex(next);
    setSelected(shootQueue[next]);
    setRecentIds(pushRecent(shootQueue[next].id));
  };

  const openAddLoc = () => {
    setEditingLoc(null);
    setLocDialogOpen(true);
  };

  const editLoc = (l: MyLocation) => {
    setEditingLoc(l);
    setLocDialogOpen(true);
  };

  const saveLoc = (loc: MyLocation) => {
    const wasEditing = !!editingLoc;
    const res = saveMyLocation(loc);
    setLocDialogOpen(false);
    if (res.ok) {
      reload();
      toast(wasEditing ? 'لوکیشن ویرایش شد.' : 'لوکیشن ذخیره شد.');
    } else {
      toast(res.error || 'ذخیره لوکیشن انجام نشد.', false);
    }
  };

  const removeLoc = (l: MyLocation) => {
    setConfirmRequest({
      title: 'حذف لوکیشن',
      text: 'لوکیشن «' + l.name + '» حذف شود؟',
      confirmLabel: 'حذف لوکیشن',
      tone: 'danger',
      icon: Trash2,
      onConfirm: () => {
        deleteMyLocation(l.id);
        reload();
        toast('لوکیشن حذف شد.');
      },
    });
  };

  const useLocationForWeather = (l: MyLocation) => {
    setSelectedLocationId(l.id);
    setSelLocId(l.id);
    goTab('weather');
  };

  const useCurrentForWeather = () => {
    setSelectedLocationId(null);
    setSelLocId(null);
    goTab('weather');
  };

  const selectedLocation = useMemo(
    () => myLocations.find((l) => l.id === selectedLocationId) || null,
    [myLocations, selectedLocationId]
  );

  

  const saveStudio = (p: any) => {
    saveStudioProfile(p);
    setStudioProfile(p);
    setStudioDialogOpen(false);
    toast('پروفایل استودیو ذخیره شد.');
  };

  const addOfficeProject = () => {
    const id = 'proj_' + Date.now().toString(36);
    const proj = { id, name: 'پروژه جدید', createdAt: Date.now(), updatedAt: Date.now() };
    setDraftOfficeProject(proj);
    setSelectedProjectId(id);
    setProjectEditorMode('create');
    goTab('office-project-detail');
  };

  const selectOfficeProject = (p: any) => {
    setDraftOfficeProject(null);
    setSelectedProjectId(p.id);
    setProjectEditorMode('view');
    goTab('office-project-detail');
  };

  const editOfficeProject = (p: any) => {
    setDraftOfficeProject(null);
    setSelectedProjectId(p.id);
    setProjectEditorMode('edit');
    goTab('office-project-detail');
  };

  const saveOfficeProj = (p: any) => {
    const result = saveOfficeProject(p);
    if (result.ok) {
      reload();
      toast('پروژه ذخیره شد.');
    } else {
      toast(result.error || 'ذخیره پروژه انجام نشد.', false);
    }
  };

  const deleteOfficeProj = (id: string) => {
    deleteOfficeProject(id);
    reload();
    setSelectedProjectId(null);
    // ناوبری بازگشت توسط onBack={goBack} در خود صفحه انجام می‌شود
    toast('پروژه حذف شد.');
  };

  const requestDeleteOfficeProject = (project: any) => {
    setConfirmRequest({
      title: 'حذف پروژه',
      text: `پروژه «${project.name}» حذف شود؟ این کار برگشت‌پذیر نیست.`,
      confirmLabel: 'حذف پروژه',
      tone: 'danger',
      icon: Trash2,
      onConfirm: () => deleteOfficeProj(project.id),
    });
  };

  const completeNewOfficeProject = (project: any) => {
    const result = saveOfficeProject(project);
    if (!result.ok) {
      toast(result.error || 'ذخیره پروژه انجام نشد.', false);
      return;
    }
    setDraftOfficeProject(null);
    setSelectedProjectId(project.id);
    setProjectEditorMode('created');
    reload();
    setTab('office-project-detail');
    scrollTop();
    toast('پروژه ثبت شد؛ قرارداد PDF باز می‌شود.');
  };

  const cancelNewOfficeProject = () => {
    setDraftOfficeProject(null);
    setSelectedProjectId(null);
    setProjectEditorMode('view');
    goBack();
  };

  const selectedProject = draftOfficeProject || (selectedProjectId ? getOfficeProject(selectedProjectId) : null);

  const filtered = useMemo(() => filterPoses(poses, filters, favoriteIds), [poses, filters, favoriteIds]);
  const mineCount = useMemo(() => poses.filter((p) => p.isCustom).length, [poses]);

  if (booting) return <Splash leaving={leavingSplash} />;
  if (showIntro) {
    return (
      <Onboarding
        onDone={() => {
          markOnboarded();
          setShowIntro(false);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen pb-24 ${tab === 'weather' ? 'weather-app' : ''}`}>
      <Header
        onOpenMenu={() => setMenuOpen(true)}
        onOpenAddPose={openAddPose}
      />

      <main className="max-w-3xl mx-auto px-3 pt-5">
        {tab === 'home' && (
          <HomeView
            poses={poses}
            favoriteIds={favoriteIds}
            recentIds={recentIds}
            onSelect={openPose}
            onDelete={removePose}
            onAddToProject={addToProject}
            onToggleFavorite={handleFavorite}
            onOpenAddPose={openAddPose}
            onPickCategory={pickCategory}
            onPickLocation={pickLocation}
            onPickScenario={pickScenario}
            onPickMood={pickMood}
            onTab={goTab}
            selectedLocation={selectedLocation}
            onOpenWeather={() => goTab('weather')}
            onOpenMyLocations={() => goTab('mylocations')}
            onQuickStart={() => setQuickStartOpen(true)}
          />
        )}

        {tab === 'affiches' && <AfficheView />}
        {tab === 'colleagues' && <ColleaguesView />}

        {tab === 'library' && (
          <LibraryView
            poses={filtered}
            allPoses={poses}
            filters={filters}
            onFilters={setFilters}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleFavorite}
            onSelect={openPose}
            onDelete={removePose}
            onAddToProject={addToProject}
          />
        )}

        {tab === 'locations' && (
          <LocationsView
            poses={poses}
            onPickLocation={pickLocation}
            onPickLocationSpecial={pickLocationSpecial}
          />
        )}

        {tab === 'mylocations' && (
          <MyLocationsView
            locations={myLocations}
            selectedId={selectedLocationId}
            onAdd={openAddLoc}
            onEdit={editLoc}
            onDelete={removeLoc}
            onUseForWeather={useLocationForWeather}
            onUseCurrent={useCurrentForWeather}
          />
        )}

        {tab === 'office' && (
          <OfficeView
            projects={officeProjects}
            profile={studioProfile}
            onAddProject={addOfficeProject}
            onSelectProject={selectOfficeProject}
            onEditProject={editOfficeProject}
            onDeleteProject={requestDeleteOfficeProject}
            onEditProfile={() => setStudioDialogOpen(true)}
          />
        )}

        {tab === 'office-project-detail' && selectedProject && (
          <ProjectDetailView
            project={selectedProject}
            profile={studioProfile}
            onBack={goBack}
            onSave={saveOfficeProj}
            onDelete={deleteOfficeProj}
            startEditing={projectEditorMode === 'edit' || projectEditorMode === 'create'}
            isCreating={projectEditorMode === 'create'}
            autoOpenContract={projectEditorMode === 'created'}
            onCreateComplete={completeNewOfficeProject}
            onCancelCreate={cancelNewOfficeProject}
          />
        )}

        {tab === 'weather' && (
          <WeatherView
            selected={selectedLocation}
            onBack={goBack}
            onManageLocations={() => goTab('mylocations')}
          />
        )}

        {tab === 'favorites' && (
          <FavoritesView
            poses={poses}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleFavorite}
            onSelect={openPose}
            onDelete={removePose}
            onAddToProject={addToProject}
            onTab={goTab}
            newShotlistRequest={newShotlistRequest}
            onNewShotlistHandled={() => setNewShotlistRequest(0)}
          />
        )}

        {tab === 'myposes' && (
          <MyPosesView
            poses={poses}
            onSelect={openPose}
            onEdit={editPose}
            onDelete={removePose}
            onPromote={promote}
            onOpenAddPose={openAddPose}
          />
        )}

        {tab === 'checklist' && <GearChecklist />}

        {tab === 'settings' && (
          <SettingsView
            poses={poses}
            favoriteIds={favoriteIds}
            prefs={prefs}
            onPrefs={updatePrefs}
            onReload={reload}
            onToast={toast}
            onTab={goTab}
          />
        )}

        {tab === 'principles' && <PrinciplesView />}
        {tab === 'pose-tips' && <PoseTipsView />}

        {tab === 'detail' && selected && (
          <PoseDetailView
            pose={selected}
            onBack={goBack}
            isFavorite={favoriteIds.includes(selected.id)}
            onToggleFavorite={handleFavorite}
            onNextPose={() => nextPose(false)}
            onDataChanged={reload}
            onDelete={removePose}
            onEdit={editPose}
            onAddToProject={addToProject}
            onToast={toast}
            bigScript={prefs.bigScript}
          />
        )}

        {tab === 'detail' && !selected && (
          <div className="card p-8 text-center">
            <p className="text-[13px] text-muted">ابتدا یک ژست انتخاب کنید.</p>
            <button onClick={() => goTab('library')} className="btn btn-primary mt-4">
              رفتن به کتابخانه
            </button>
          </div>
        )}
      </main>

      <BottomNav
        activeTab={tab}
        onTabChange={goTab}
        favoritesCount={favoriteIds.length}
        onNewOfficeProject={addOfficeProject}
        onNewShotlist={() => { goTab('favorites'); setNewShotlistRequest(v => v + 1); }}
      />

      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeTab={tab}
        onNavigate={goTab}
        onOpenAddPose={openAddPose}
        onOpenStudioProfile={() => setStudioDialogOpen(true)}
        onChangeProfileImage={(dataUrl) => {
          if (!studioProfile) return;
          const updated = { ...studioProfile, logo: dataUrl, updatedAt: Date.now() };
          saveStudioProfile(updated);
          setStudioProfile(updated);
          toast('عکس پروفایل ذخیره شد.');
        }}
        onOpenChecklist={() => goTab('checklist')}
        profile={studioProfile}
        theme={prefs.theme}
        onToggleTheme={() =>
          updatePrefs({ ...prefs, theme: prefs.theme === 'dark' ? 'light' : 'dark' })
        }
        counts={{ total: poses.length, favorites: favoriteIds.length, mine: mineCount }}
      />



      <AddPoseSheet
        open={sheetOpen}
        editing={editingPose}
        onClose={() => setSheetOpen(false)}
        onSaved={(message, ok) => {
          toast(message, ok);
          if (ok) reload();
        }}
      />

      <ToastStack items={toasts} />

      <ConfirmDialog request={confirmRequest} onClose={() => setConfirmRequest(null)} />

      <AddToProjectSheet
        pose={addToProjectPose}
        onClose={() => setAddToProjectPose(null)}
        onAdded={(message) => toast(message, true)}
      />

      <StudioProfileDialog
        open={studioDialogOpen}
        profile={studioProfile}
        onCancel={() => setStudioDialogOpen(false)}
        onConfirm={saveStudio}
      />

      <MyLocationDialog
        open={locDialogOpen}
        editing={editingLoc}
        onCancel={() => setLocDialogOpen(false)}
        onConfirm={saveLoc}
      />

      <QuickStartSheet
        open={quickStartOpen}
        onCancel={() => setQuickStartOpen(false)}
        onStart={startQuickShoot}
      />

      <ShootMode
        open={shootOpen}
        pose={selected}
        onClose={() => setShootOpen(false)}
        onNext={quickShootNext}
        isFavorite={!!selected && favoriteIds.includes(selected.id)}
        onToggleFavorite={handleFavorite}
        bigScript={prefs.bigScript}
        queuePosition={shootQueue.length ? { index: shootIndex, total: shootQueue.length } : undefined}
        onDataChanged={reload}
      />
    </div>
  );
}
