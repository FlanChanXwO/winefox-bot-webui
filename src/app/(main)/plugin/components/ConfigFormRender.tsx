import React from "react";
import {Input, Select, SelectItem, Switch, Textarea} from "@nextui-org/react";
import {PluginConfigField} from "@/api/plugin";

interface Props {
    field: PluginConfigField;
    value: any;
    onChange: (val: any) => void;
}

export default function ConfigFormRender({ field, value, onChange }: Props) {

    if (field.type === "select" && field.options) {
        return (
            <Select
                label={field.label}
                placeholder={`选择${field.label}`}
                selectedKeys={value ? [String(value)] : []}
                description={field.description}
                variant="bordered"
                onChange={(e) => onChange(e.target.value)}
            >
                {field.options.map((opt) => {
                    const keys = Object.keys(opt);
                    const val = opt['value'] || opt[keys[0]];
                    const lab = opt['label'] || opt[keys[1]] || val;
                    return <SelectItem key={String(val)} value={String(val)}>{String(lab)}</SelectItem>;
                })}
            </Select>
        );
    }

    if (field.type === "bool" || field.type === "boolean") {
        return (
            <div className="flex flex-col gap-1 py-1">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">{field.label}</span>
                        {field.description && <span className="text-xs text-gray-400">{field.description}</span>}
                    </div>
                    <Switch
                        isSelected={Boolean(value)}
                        onValueChange={onChange}
                    />
                </div>
            </div>
        );
    }

    if (["number", "integer", "long"].includes(field.type)) {
        return (
            <Input
                type="number"
                label={field.label}
                value={String(value ?? "")}
                description={field.description}
                variant="bordered"
                onValueChange={(val) => onChange(Number(val))}
            />
        );
    }

    if (["array", "map"].includes(field.type)) {
        return (
            <Textarea
                label={`${field.label} (JSON)`}
                value={typeof value === 'object' ? JSON.stringify(value) : String(value ?? "")}
                description={field.description}
                variant="bordered"
                onValueChange={(val) => {
                    try { onChange(JSON.parse(val)); } catch (e) { /* 编辑中暂不处理解析错误 */ }
                }}
            />
        )
    }

    // Default string
    return (
        <Input
            type="text"
            label={field.label}
            value={String(value ?? "")}
            description={field.description}
            variant="bordered"
            onValueChange={onChange}
        />
    );
}
