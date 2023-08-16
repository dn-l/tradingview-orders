import { PropsWithChildren, useEffect, useRef } from 'react';

const CLOSE_ANIMATION_DELAY_MS = 200;

export interface DialogProps {
  onClose: () => void;
}

export const Dialog = ({
  onClose,
  children,
}: PropsWithChildren<DialogProps>) => {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (ref.current === null) {
      return;
    }
    if (!ref.current.open) {
      ref.current.showModal();
    }
    let timeout: number;
    const handleClose = () => {
      timeout = setTimeout(onClose, CLOSE_ANIMATION_DELAY_MS);
    };
    ref.current.addEventListener('close', handleClose);

    return () => {
      clearTimeout(timeout);
      ref.current?.removeEventListener('close', handleClose);
    };
  }, []);

  return (
    <dialog className="modal" ref={ref}>
      <div className="modal-box">
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={() => ref.current?.close()}
        >
          ✕
        </button>
        {children}
      </div>
    </dialog>
  );
};
