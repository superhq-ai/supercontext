import { Check, ChevronsUpDown, X } from "lucide-react";
import * as React from "react";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Option {
	value: string;
	label: string;
}

interface MultiSelectProps {
	options: Option[];
	selected: string[];
	onChange: (selected: string[]) => void;
	className?: string;
	mode?: "single" | "multiple";
}

export function SpaceSelector({
	options,
	selected,
	onChange,
	className,
	mode = "multiple",
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);
	const triggerRef = React.useRef<HTMLButtonElement>(null); // Ref for the trigger
	const [triggerWidth, setTriggerWidth] = React.useState<number | undefined>(
		undefined,
	);

	useEffect(() => {
		if (triggerRef.current) {
			const width = triggerRef.current.getBoundingClientRect().width;
			setTriggerWidth(width);
		}
	}, []);

	const handleSelect = (value: string) => {
		if (mode === "single") {
			onChange([value]);
			setOpen(false);
		} else {
			const newSelected = selected.includes(value)
				? selected.filter((item) => item !== value)
				: [...selected, value];
			onChange(newSelected);
		}
	};

	const handleRemove = (value: string) => {
		onChange(selected.filter((item) => item !== value));
	};

	const selectedLabel =
		mode === "single"
			? options.find((option) => option.value === selected[0])?.label
			: null;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				{/** biome-ignore lint/a11y/useSemanticElements: <Button> is used as a combobox trigger */}
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn("w-full justify-between", className)}
					ref={triggerRef} // Attach ref to the trigger
				>
					<div className="flex gap-1 flex-wrap">
						{mode === "multiple" ? (
							selected.length > 0 ? (
								selected
									.map((value) =>
										options.find((option) => option.value === value),
									)
									.filter(Boolean)
									.map(
										(option) =>
											option && (
												<Badge
													variant="secondary"
													key={option.value}
													className="mr-1"
													onClick={(e) => {
														e.stopPropagation();
														handleRemove(option.value);
													}}
												>
													{option.label}
													<X className="ml-1 h-4 w-4" />
												</Badge>
											),
									)
							) : (
								<span>Select spaces...</span>
							)
						) : selectedLabel ? (
							<span>{selectedLabel}</span>
						) : (
							<span>Select a space...</span>
						)}
					</div>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="p-0"
				style={{ width: triggerWidth ? `${triggerWidth}px` : "auto" }} // Set width dynamically
			>
				<Command>
					<CommandInput placeholder="Search spaces..." />
					<CommandEmpty>No space found.</CommandEmpty>
					<CommandGroup>
						{options.map((option) => (
							<CommandItem
								key={option.value}
								onSelect={() => handleSelect(option.value)}
							>
								<Check
									className={cn(
										"mr-2 h-4 w-4",
										selected.includes(option.value)
											? "opacity-100"
											: "opacity-0",
									)}
								/>
								{option.label}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
