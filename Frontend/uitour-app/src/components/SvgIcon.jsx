import icons from "../../assets/icons";

export default function SvgIcon({ name, ...props }) {
    const IconComponent = icons[name];
    return IconComponent ? <IconComponent {...props} /> : null;
}