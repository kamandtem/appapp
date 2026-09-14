import React from 'react';
import { PlusCircle, Sparkles, Pencil, Trash2, ImagePlus } from 'lucide-react';
import { Pose } from '../types/pose';
import { PoseVisual } from '../components/PoseVisual';
import { EmptyState } from '../components/EmptyState';
import { SectionGuide } from '../components/SectionGuide';
import { scenarioOf, scopeLabel } from '../data/taxonomy';

interface Props {
  poses: Pose[];
  onSelect: (p: Pose) => void;
  onEdit: (p: Pose) => void;
  onDelete: (p: Pose) => void;
  onPromote: (p: Pose) => void;
  onOpenAddPose: () => void;
}

/** ژست‌هایی که خود کاربر اضافه کرده است */
export const MyPosesView: React.FC<Props> = ({
  poses,
  onSelect,
  onEdit,
  onDelete,
  onPromote,
  onOpenAddPose,
}) => {
  const mine = poses.filter((p) => p.isCustom);

  return (
    <div className="space-y-4">
      <SectionGuide section="myposes" title="ژست‌های من" text="ژست‌های شخصی و عکس‌های مرجعت را اینجا نگه دار." />
      <div className="card p-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-extrabold text-[15px]">
            <Sparkles className="w-4 h-4 text-gold" />
            ژست‌های من
          </h2>

        </div>
        <button onClick={onOpenAddPose} className="btn btn-primary shrink-0">
          <PlusCircle className="w-4 h-4" />
          جدید
        </button>
      </div>

      {mine.length === 0 ? (
        <EmptyState
          icon={ImagePlus}
          title="اولین ژست خودت را اضافه کن"
          text="یک عکس از گالری یا دوربین انتخاب کن، مراحل اجرا و جمله‌هایی که به سوژه می‌گویی را بنویس. همه‌چیز روی همین گوشی ذخیره می‌شود."
          action={{ label: 'افزودن ژست جدید', onClick: onOpenAddPose }}
        />
      ) : (
        <div className="space-y-3">
          {mine.map((p) => (
            <div key={p.id} className="card overflow-hidden flex">
              <button
                onClick={() => onSelect(p)}
                className="w-28 shrink-0 relative"
                aria-label={p.title}
              >
                <PoseVisual pose={p} />
              </button>

              <div className="flex-1 p-3 min-w-0">
                <button onClick={() => onSelect(p)} className="text-right w-full">
                  <h3 className="font-bold text-[13px] line-clamp-1">{p.title}</h3>
                  <span className="text-[10px] text-gold font-mono">کد عکس: {p.transferCode || p.id}</span>
                  <p className="text-[11px] text-muted line-clamp-2 mt-1 leading-relaxed">
                    {p.steps[0]}
                  </p>
                </button>

                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="pill !text-[10px] pill-on">{scenarioOf(p)}</span>
                  <span className="pill !text-[10px]">{scopeLabel(p)}</span>
                  <span className="pill !text-[10px]">{p.category}</span>
                  {p.mood && <span className="pill !text-[10px]">{p.mood}</span>}
                  {p.framing && <span className="pill !text-[10px]">{p.framing}</span>}
                </div>

                <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-line">
                  <button
                    onClick={() => onEdit(p)}
                    className="flex items-center gap-1 text-[11px] font-bold text-gold"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    ویرایش
                  </button>
                  <button
                    onClick={() => onPromote(p)}
                    className="flex items-center gap-1 text-[11px] font-bold text-teal"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    انتقال به اصلی‌ها
                  </button>
                  <button
                    onClick={() => onDelete(p)}
                    className="flex items-center gap-1 text-[11px] font-bold"
                    style={{ color: 'var(--color-rose)' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
