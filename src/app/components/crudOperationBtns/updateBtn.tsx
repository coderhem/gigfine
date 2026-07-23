import { PiNotePencilBold } from "react-icons/pi";

type Props = {
  updateText?: string;
  btnLink?: string;
  updateIcon?: boolean;
  customClass?: string;
  id?: string;
};

const UpdateBtn = ({ updateIcon, updateText, btnLink, customClass }: Props) => {
  return (
    <>
      {updateIcon && (
        <a
          href={btnLink}
          className={`update-btn cursor-pointer ${customClass}`}
        >
          <PiNotePencilBold size={17} />
        </a>
      )}
      {updateText && (
        <a
          href={btnLink}
          className={`update-btn cursor-pointer ${customClass}`}
        >
          {updateText}
        </a>
      )}
    </>
  );
};

export default UpdateBtn;
