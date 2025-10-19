import icons from "../assets/icons/index.js";

export default function SvgIcon({ name, ...props }) {
    const IconComponent = icons[name];
    return IconComponent ? <IconComponent {...props} /> : null;
}