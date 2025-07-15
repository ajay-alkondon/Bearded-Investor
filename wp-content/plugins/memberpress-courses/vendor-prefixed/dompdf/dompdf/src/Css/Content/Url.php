<?php
/**
 * @license LGPL-2.1
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */
namespace memberpress\courses\Dompdf\Css\Content;

final class Url extends ContentPart
{
    /**
     * @var string
     */
    public $url;

    public function __construct(string $url)
    {
        $this->url = $url;
    }

    public function equals(ContentPart $other): bool
    {
        return $other instanceof self
            && $other->url === $this->url;
    }

    public function __toString(): string
    {
        return "url(\"" . str_replace("\"", "\\\"", $this->url) . "\")";
    }
}
